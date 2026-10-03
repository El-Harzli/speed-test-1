import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatPrice } from "./format";

const TANGIER_CENTER = [35.7595, -5.834];

function createPriceIcon(price, isSelected) {
  const bg = isSelected ? "#6d213c" : "#ffffff";
  const fg = isSelected ? "#ffffff" : "#1a1a1a";
  const border = isSelected ? "#6d213c" : "rgba(109,33,60,0.18)";

  const html = `
    <div style="position:relative;">
      <div style="
        background:${bg};
        color:${fg};
        border:1px solid ${border};
        box-shadow:0 4px 14px rgba(0,0,0,0.14);
        padding:5px 10px;
        border-radius:999px;
        font-size:12px;
        font-weight:600;
        white-space:nowrap;
        transform:translate(-50%, -130%);
      ">${formatPrice(price)}</div>
      <div style="
        position:absolute;
        left:-4px;
        top:-4px;
        width:8px;
        height:8px;
        border-radius:9999px;
        background:#6d213c;
        border:2px solid white;
        box-shadow:0 1px 4px rgba(0,0,0,0.3);
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

// MapContainer only applies `center`/`zoom` on its first render — it isn't
// a controlled component. Without this, changing filters while already on
// the map tab moves the markers but leaves the viewport where it was.
function RecenterMap({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

function hasCoordinates(p) {
  return typeof p.lat === "number" && typeof p.lng === "number" && !Number.isNaN(p.lat) && !Number.isNaN(p.lng);
}

function PropertyMap({ properties, selectedId, onSelectProperty }) {
  const mappable = useMemo(() => properties.filter(hasCoordinates), [properties]);

  const center = useMemo(() => {
    if (mappable.length === 0) return TANGIER_CENTER;
    const lat =
      mappable.reduce((sum, p) => sum + p.lat, 0) / mappable.length;
    const lng =
      mappable.reduce((sum, p) => sum + p.lng, 0) / mappable.length;
    return [lat, lng];
  }, [mappable]);

  return (
    <div className="isolate w-full h-[420px] sm:h-[520px] lg:h-[600px] rounded-[16px] overflow-hidden border border-accent-500/10">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} />
        {mappable.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={createPriceIcon(p.price, p.id === selectedId)}
            eventHandlers={{
              click: () => onSelectProperty(p.id),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default PropertyMap;
