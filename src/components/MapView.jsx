import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatTimestamp, getPreferredTimestamp, getTimestampMs } from '../utils/helpers';
import { getUserColor } from '../utils/markerColors';

export default function MapView({ locations, selectedUser, onMarkerClick, activeMapIndex }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([-6.2, 106.8], 12);

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

    // Add Premium Dark basemap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and Polylines when locations or selectedUser changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];

    // Clear existing polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (locations.length === 0) return;

    const latLngs = [];

    // Sort locations by timestamp ascending to draw path chronologically,
    // but markers list in standard order (latest is index 0 in the list).
    // Let's find latest point.
    // The list is sorted newest first. So index 0 is the latest point.
    const latestLoc = locations[0];

    locations.forEach((loc, i) => {
      const { latitude, longitude, userName, battery, isCharging, accuracy, deviceModel, source } = loc;
      if (!latitude || !longitude) return;

      const userColor = getUserColor(userName);
      const isLatest = i === 0;
      const isFocused = activeMapIndex === i;

      // Small custom dot circle marker
      const markerSize = isLatest ? 18 : 12;
      const markerHtml = `
        <div class="simple-marker-dot ${isLatest ? 'latest' : ''} ${isFocused ? 'focused' : ''}" 
             style="--marker-color: ${userColor}; width: ${markerSize}px; height: ${markerSize}px;">
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker-wrapper',
        html: markerHtml,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
        popupAnchor: [0, -markerSize / 2]
      });

      const marker = L.marker([latitude, longitude], {
        icon: customIcon,
      }).addTo(map);

      // Info Popup
      const popupContent = `
        <div class="popup-title" style="color: ${userColor}; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; margin-bottom: 6px;">
          👤 ${userName || 'Unknown'} ${isLatest ? '<span class="latest-popup-badge">Terbaru</span>' : ''}
        </div>
        <div class="popup-grid">
          <div><strong>Waktu:</strong> ${formatTimestamp(getPreferredTimestamp(loc))}</div>
          <div><strong>Akurasi:</strong> ${Math.round(accuracy) ? Math.round(accuracy) + 'm' : '—'}</div>
          <div><strong>Baterai:</strong> ${battery !== undefined && battery !== null ? battery + '%' : '—'} ${isCharging ? '⚡' : ''}</div>
          <div><strong>Perangkat:</strong> ${deviceModel || '—'}</div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 260 });

      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(i);
        }
      });

      markersRef.current.push(marker);
      latLngs.push([latitude, longitude]);
    });

    // Draw route polyline with matching user color (or blue gradient if multi-user)
    if (latLngs.length > 1) {
      const lineColor = selectedUser ? getUserColor(selectedUser) : '#5b8def';
      polylineRef.current = L.polyline(latLngs, {
        color: lineColor,
        weight: 3.5,
        opacity: 0.75,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);
    }

    // Auto-fit bounds on initial or filtered render
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 16,
        animate: true,
        duration: 0.8
      });

      // Open latest popup by default
      if (locations[0] && markersRef.current[0]) {
        // If it's a single marker or we just reset the data, open it
        markersRef.current[0].openPopup();
      }
    }
  }, [locations, selectedUser]);

  // Handle manual focus triggers from the list selection
  useEffect(() => {
    if (activeMapIndex === null || activeMapIndex === undefined) return;
    const map = mapInstanceRef.current;
    const marker = markersRef.current[activeMapIndex];
    if (map && marker) {
      map.setView(marker.getLatLng(), 16, { animate: true, duration: 0.6 });
      marker.openPopup();
    }
  }, [activeMapIndex]);

  // Stat overlays over the map
  const latestLoc = locations[0];

  return (
    <div className="map-container-fullscreen">
      <div id="map" ref={mapContainerRef}></div>

      {/* Map Stat Chips */}
      {locations.length > 0 && latestLoc && (
        <div className="map-overlay-stats">
          <div className="stat-chip">
            <span className="chip-icon">📍</span>
            {locations.length} titik
          </div>
          {latestLoc.battery !== undefined && latestLoc.battery !== null && (
            <div className="stat-chip">
              <span className="chip-icon">
                {latestLoc.isCharging ? '⚡' : latestLoc.battery <= 15 ? '🪫' : '🔋'}
              </span>
              {latestLoc.battery}%
            </div>
          )}
          {latestLoc.accuracy && (
            <div className="stat-chip">
              <span className="chip-icon">🎯</span>
              {Math.round(latestLoc.accuracy)}m
            </div>
          )}
        </div>
      )}
    </div>
  );
}
