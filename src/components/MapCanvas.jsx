import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getUserColor, darkenColor } from '../utils/markerColors';
import { formatTimestamp } from '../utils/helpers';

// popupTrigger = { index, ts } — ts berubah setiap klik agar useEffect selalu fire
export default function MapCanvas({ locations, selectedUser, activeIndex, onMarkerClick, popupTrigger }) {
  const mapRef       = useRef(null);
  const mapInstance  = useRef(null);
  const markersLayer = useRef(L.layerGroup());
  const polylineLayer = useRef(null);
  const markersRef   = useRef([]); // simpan instance marker per-index untuk openPopup()

  // Reverse geocoding via Nominatim (dipanggil dari dalam HTML popup)
  useEffect(() => {
    window.lookupAddress = async (id, lat, lon) => {
      const btn = document.querySelector(`#address-${id} .btn-lookup`);
      if (btn) { btn.disabled = true; btn.innerText = 'Mencari...'; }

      try {
        const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=geojson&lat=${lat}&lon=${lon}&layer=address`);
        const data = await res.json();
        const address = data.features[0].properties.display_name;
        const container = document.getElementById(`address-${id}`);
        if (container) {
          const div = document.createElement('div');
          div.className = 'address-text';
          div.textContent = address;
          container.innerHTML = '';
          container.appendChild(div);
        }
      } catch {
        const freshBtn = document.querySelector(`#address-${id} .btn-lookup`);
        if (freshBtn) { freshBtn.disabled = false; freshBtn.innerText = 'Gagal, coba lagi'; }
      }
    };
    return () => { delete window.lookupAddress; };
  }, []);

  // Inisialisasi peta (sekali saja)
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false })
      .setView([-6.2, 106.8], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    markersLayer.current.addTo(map);
    mapInstance.current = map;

    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  // Rebuild semua marker + polyline setiap kali locations / activeIndex berubah
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    markersLayer.current.clearLayers();
    markersRef.current = []; // reset referensi marker

    if (polylineLayer.current) {
      map.removeLayer(polylineLayer.current);
      polylineLayer.current = null;
    }

    if (locations.length === 0) return;

    const latLngs = [];

    locations.forEach((loc, i) => {
      if (!loc.latitude || !loc.longitude) return;

      const isLatest      = i === 0;
      const isActive      = activeIndex === i;
      const color         = loc.isStationary ? darkenColor(getUserColor(loc.userName), 60) : getUserColor(loc.userName);
      const sequenceNumber = locations.length - i; // nomor urut: terbaru = tertinggi

      // Icon marker
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-dot-wrapper">
            ${isLatest ? `<div class="marker-pulse" style="color:${color}"></div>` : ''}
            <div class="marker-dot${isActive ? ' active' : ''}" style="background-color:${color}">
              <span class="marker-number">${sequenceNumber}</span>
            </div>
          </div>`,
        iconSize:   [30, 30],
        iconAnchor: [15, 15],
      });

      // Konten popup — nomor urut #N di header, warna sesuai user
      const popupContent = `
        <div class="popup-content">
          <div class="popup-header">
            <div class="popup-seq-badge" style="background:${color}">#${sequenceNumber}</div>
            <span class="popup-uname" style="color:${color}">${loc.userName || 'Unknown'}</span>
          </div>
          <div class="popup-item"><strong>Waktu:</strong> ${formatTimestamp(loc.localTimestamp)}</div>
          <div class="popup-item"><strong>Perangkat:</strong> ${loc.deviceModel || 'N/A'}</div>
          <div class="popup-item"><strong>Akurasi:</strong> ${loc.accuracy != null ? Math.round(loc.accuracy) + 'm' : 'N/A'}</div>
          <div class="popup-item"><strong>Baterai:</strong> ${loc.battery !== undefined ? loc.battery + '%' : 'N/A'}</div>
          <div id="address-${loc.id}" class="popup-address">
            <button class="btn-lookup" onclick="window.lookupAddress('${loc.id}',${loc.latitude},${loc.longitude})">
              Lihat Alamat
            </button>
          </div>
        </div>`;

      const marker = L.marker([loc.latitude, loc.longitude], { icon });

      // Bind popup (ini otomatis menambah click listener internal Leaflet)
      marker.bindPopup(popupContent, { className: 'custom-popup', minWidth: 220 });

      // Hapus listener click bawaan Leaflet (yang auto-buka popup saat marker diklik)
      // Ganti hanya dengan handler kita → zoom saja, TANPA buka popup
      marker.off('click');
      marker.on('click', () => onMarkerClick(i));

      marker.addTo(markersLayer.current);
      markersRef.current[i] = marker; // simpan referensi untuk openPopup() programmatik
      latLngs.push([loc.latitude, loc.longitude]);
    });

    // Polyline antar titik
    if (latLngs.length > 1) {
      polylineLayer.current = L.polyline(latLngs, {
        color:     selectedUser ? getUserColor(selectedUser) : '#2563eb',
        weight:    3,
        opacity:   0.5,
        dashArray: '5, 10',
      }).addTo(map);
    }

    if (latLngs.length > 0) {
      map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50], maxZoom: 16 });
    }
  }, [locations, selectedUser, activeIndex]);

  // Pan ke marker aktif saat activeIndex berubah
  useEffect(() => {
    if (activeIndex !== null && locations[activeIndex]) {
      const { latitude, longitude } = locations[activeIndex];
      mapInstance.current?.setView([latitude, longitude], 17, { animate: true });
    }
  }, [activeIndex, locations]);

  // Buka popup secara programmatik dari klik kartu di History
  // Delay 500ms agar pan/zoom animation selesai dulu sebelum popup muncul
  useEffect(() => {
    if (popupTrigger?.index == null) return;
    const timer = setTimeout(() => {
      markersRef.current[popupTrigger.index]?.openPopup();
    }, 500);
    return () => clearTimeout(timer); // batal jika klik kartu lain sebelum 500ms
  }, [popupTrigger]);

  return <div ref={mapRef} className="map-canvas" />;
}
