import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Same pin styling as the browse page's map marker (see PropertyMap.jsx),
// minus the price bubble — on a single-listing map the price is already
// shown right above, so the pin only needs to mark "here".
function createPinIcon() {
  const html = `
    <div style="
      width:16px;
      height:16px;
      border-radius:9999px;
      background:#6d213c;
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

// Renders nothing if this listing has no exact coordinates set — only
// `location` (free text) is required on the property form, lat/lng are
// optional, so this is a normal state, not an error.
function PropertyLocationMap({ lat, lng }) {
  if (typeof lat !== "number" || typeof lng !== "number" || Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  return (
    <div className="isolate w-full h-64 rounded-[16px] overflow-hidden border border-accent-500/10">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={createPinIcon()} />
      </MapContainer>
    </div>
  );
}

export default PropertyLocationMap;
