import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getUserColor } from '../utils/markerColors';

export default function MapCanvas({ locations, selectedUser, activeIndex, onMarkerClick }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(L.layerGroup());
  const polylineLayer = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([-6.2, 106.8], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);
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
      const color = getUserColor(loc.userName);
      
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-dot-wrapper">
            ${isLatest ? `<div class="marker-pulse" style="color: ${color}"></div>` : ''}
            <div class="marker-dot ${isActive ? 'active' : ''}" style="background-color: ${color}"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon })
        .on('click', () => onMarkerClick(i))
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

  useEffect(() => {
    if (activeIndex !== null && locations[activeIndex]) {
      const { latitude, longitude } = locations[activeIndex];
      mapInstance.current?.setView([latitude, longitude], 17, { animate: true });
    }
  }, [activeIndex]);

  return <div ref={mapRef} className="map-canvas" />;
}
