import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LocateFixed } from "lucide-react";
import AppHeader from "@/components/AppHeader";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapVendor {
  id: string;
  name: string;
  city: string | null;
  categories: string[] | null;
  lat: number;
  lng: number;
  marketplace_url: string | null;
  website: string | null;
}

const FlyTo = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const VendorMapPage = ({ embed = false }: { embed?: boolean }) => {
  const { t } = useLanguage();
  const [vendors, setVendors] = useState<MapVendor[]>([]);
  const [search, setSearch] = useState("");
  const [flyTarget, setFlyTarget] = useState<{ center: [number, number]; zoom: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("vendors")
        .select("id, name, city, categories, lat, lng, marketplace_url, website")
        .eq("status", "active")
        .not("lat", "is", null)
        .not("lng", "is", null);
      if (data) setVendors(data as unknown as MapVendor[]);
    };
    load();
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}&limit=1`);
      const results = await res.json();
      if (results.length > 0) {
        setFlyTarget({ center: [parseFloat(results[0].lat), parseFloat(results[0].lon)], zoom: 11 });
      }
    } catch {}
  };

  const handleLocate = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setFlyTarget({ center: [pos.coords.latitude, pos.coords.longitude], zoom: 12 }),
      () => {}
    );
  };

  const map = (
    <MapContainer
      center={[51.1657, 10.4515]}
      zoom={6}
      className={embed ? "w-full h-screen" : "w-full h-[calc(100vh-180px)] sm:h-[calc(100vh-140px)]"}
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {flyTarget && <FlyTo center={flyTarget.center} zoom={flyTarget.zoom} />}
      {vendors.map((v) => (
        <Marker key={v.id} position={[v.lat, v.lng]}>
          <Popup>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{v.name}</p>
              {v.city && <p className="text-muted-foreground">{v.city}</p>}
              {v.categories && v.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {v.categories.map((c) => (
                    <span key={c} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{c}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <a href={`/vendors/${v.id}`} className="text-primary text-xs font-medium hover:underline">
                  {t("vendorMap.viewProfile")}
                </a>
                {v.marketplace_url && (
                  <a href={v.marketplace_url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs font-medium hover:underline">
                    {t("vendorMap.visitShop")}
                  </a>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );

  if (embed) return map;

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="px-4 py-3 bg-background border-b flex items-center gap-2 max-w-xl mx-auto w-full">
        <Input
          placeholder={t("vendorMap.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1"
        />
        <Button size="icon" variant="outline" onClick={handleSearch}><Search className="h-4 w-4" /></Button>
        <Button size="icon" variant="outline" onClick={handleLocate}><LocateFixed className="h-4 w-4" /></Button>
      </div>
      {map}
    </div>
  );
};

export default VendorMapPage;
