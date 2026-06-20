import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getUserColor, darkenColor } from '../utils/markerColors';
import { formatTimestamp } from '../utils/helpers';

export default function MapCanvas({ locations, selectedUser, activeIndex, onMarkerClick }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(L.layerGroup());
  const polylineLayer = useRef(null);

  // FIX #6: Tambahkan return cleanup → hapus window.lookupAddress saat unmount (cegah memory leak)
  // FIX #4: Ganti innerHTML dengan textContent → cegah XSS dari response Nominatim
  useEffect(() => {
    window.lookupAddress = async (id, lat, lon) => {
      const btn = document.querySelector(`#address-${id} .btn-lookup`);
      if (btn) btn.disabled = true;
      if (btn) btn.innerText = 'Mencari...';

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=geojson&lat=${lat}&lon=${lon}&layer=address`);
        const data = await response.json();
        const address = data.features[0].properties.display_name;
        const container = document.getElementById(`address-${id}`);
        if (container) {
          // FIX #4: Pakai textContent bukan innerHTML untuk cegah XSS
          const div = document.createElement('div');
          div.className = 'address-text';
          div.textContent = address;
          container.innerHTML = '';
          container.appendChild(div);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
        // Re-query btn karena popup bisa sudah ditutup saat await selesai
        const freshBtn = document.querySelector(`#address-${id} .btn-lookup`);
        if (freshBtn) {
          freshBtn.disabled = false;
          freshBtn.innerText = 'Gagal, coba lagi';
        }
      }
    };

    // FIX #6: Cleanup global function saat komponen unmount
    return () => {
      delete window.lookupAddress;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([-6.2, 106.8], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    markersLayer.current.addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    markersLayer.current.clearLayers();
    if (polylineLayer.current) {
      map.removeLayer(polylineLayer.current);
      polylineLayer.current = null;
    }

    if (locations.length === 0) return;

    const latLngs = [];
    locations.forEach((loc, i) => {
      if (!loc.latitude || !loc.longitude) return;

      const isLatest = i === 0;
      const isActive = activeIndex === i;
      let color = getUserColor(loc.userName);

      if (loc.isStationary) {
        color = darkenColor(color, 60);
      }

      const sequenceNumber = locations.length - i;

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-dot-wrapper">
            ${isLatest ? `<div class="marker-pulse" style="color: ${color}"></div>` : ''}
            <div class="marker-dot ${isActive ? 'active' : ''}" style="background-color: ${color}">
              <span class="marker-number">${sequenceNumber}</span>
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon })
        .on('click', () => { onMarkerClick(i); })
        .bindPopup(`
          <div class="popup-content">
            <div class="popup-item"><strong>Waktu:</strong> ${formatTimestamp(loc.localTimestamp)}</div>
            <div class="popup-item"><strong>Perangkat:</strong> ${loc.deviceModel || 'N/A'}</div>
            <div class="popup-item"><strong>Akurasi:</strong> ${loc.accuracy != null ? Math.round(loc.accuracy) + 'm' : 'N/A'}</div>
            <div class="popup-item"><strong>Baterai:</strong> ${loc.battery !== undefined ? loc.battery + '%' : 'N/A'}</div>
            <div id="address-${loc.id}" class="popup-address">
              <button class="btn-lookup" onclick="window.lookupAddress('${loc.id}', ${loc.latitude}, ${loc.longitude})">Lihat Alamat</button>
            </div>
          </div>
        `, {
          className: 'custom-popup',
          minWidth: 200
        })
        .addTo(markersLayer.current);

      latLngs.push([loc.latitude, loc.longitude]);
    });

    if (latLngs.length > 1) {
      polylineLayer.current = L.polyline(latLngs, {
        color: selectedUser ? getUserColor(selectedUser) : '#2563eb',
        weight: 3,
        opacity: 0.5,
        dashArray: '5, 10'
      }).addTo(map);
    }

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [locations, selectedUser, activeIndex]);

  // FIX #7: Tambahkan locations ke dependency array agar setView update
  //         saat locations berubah sementara activeIndex tetap sama
  useEffect(() => {
    if (activeIndex !== null && locations[activeIndex]) {
      const { latitude, longitude } = locations[activeIndex];
      mapInstance.current?.setView([latitude, longitude], 17, { animate: true });
    }
  }, [activeIndex, locations]);

  return <div ref={mapRef} className="map-canvas" />;
}
