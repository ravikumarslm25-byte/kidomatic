import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (Vite can't resolve leaflet's bundled image paths)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const SALEM = [11.6643, 78.146];

function ClickHandler({ onPick }) {
  useMapEvents({ click(e) { onPick && onPick(+e.latlng.lat.toFixed(6), +e.latlng.lng.toFixed(6)); } });
  return null;
}
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) map.setView(points[0], 14);
    else if (points.length > 1) map.fitBounds(points, { padding: [40, 40] });
  }, [JSON.stringify(points)]);
  return null;
}

export default function TransportMap({ stops = [], onPick, height = 360, showRoute = true, fit = true }) {
  const marks = stops.filter((s) => s.lat && s.lng).map((s) => ({ ...s, pos: [+s.lat, +s.lng] }));
  const pts = marks.map((m) => m.pos);
  const center = pts[0] || SALEM;
  return (
    <MapContainer center={center} zoom={13} style={{ height, width: "100%", borderRadius: 16, zIndex: 0 }} scrollWheelZoom>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
      {onPick && <ClickHandler onPick={onPick} />}
      {marks.map((m, i) => (
        <Marker key={i} position={m.pos}><Popup><b>{m.name || `Stop ${i + 1}`}</b>{m.pickupTime ? <><br />Pickup {m.pickupTime}</> : null}{m.routeName ? <><br />{m.routeName}</> : null}</Popup></Marker>
      ))}
      {showRoute && pts.length > 1 && <Polyline positions={pts} pathOptions={{ color: "#1651A3", weight: 4, opacity: 0.7 }} />}
      {fit && pts.length > 0 && <FitBounds points={pts} />}
    </MapContainer>
  );
}
