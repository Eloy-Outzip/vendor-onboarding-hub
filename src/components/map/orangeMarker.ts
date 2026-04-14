import L from "leaflet";

const orangeSvg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
  <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="hsl(24,91%,48%)"/>
  <circle cx="12.5" cy="12.5" r="5.5" fill="white"/>
</svg>`);

export const orangeIcon = L.icon({
  iconUrl: `data:image/svg+xml,${orangeSvg}`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  shadowSize: [41, 41],
});
