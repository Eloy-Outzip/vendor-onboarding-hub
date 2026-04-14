import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, LocateFixed, ChevronDown, ChevronUp } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const formatUrl = (url: string) => {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

// Fix default marker icon
import { orangeIcon } from "@/components/map/orangeMarker";

interface MapVendor {
  id: string;
  name: string;
  city: string | null;
  categories: string[] | null;
  lat: number;
  lng: number;
  marketplace_url: string | null;
  website: string | null;
  slug: string | null;
  created_at: string;
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
  const [showDirectory, setShowDirectory] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const markerRefs = useRef<Record<string, L.Marker>>({});

  // Load sort order from site settings
  useEffect(() => {
    const loadSortOrder = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("map_sort_order")
        .eq("id", 1)
        .single();
      if (data?.map_sort_order) setSortBy(data.map_sort_order);
    };
    loadSortOrder();
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("vendors")
        .select("id, name, city, categories, lat, lng, marketplace_url, website, slug, created_at")
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

  const handleVendorClick = (v: MapVendor) => {
    setFlyTarget({ center: [v.lat, v.lng], zoom: 14 });
    setTimeout(() => {
      markerRefs.current[v.id]?.openPopup();
    }, 600);
  };

  const sortedVendors = [...vendors].sort((a, b) => {
    switch (sortBy) {
      case "city": return (a.city || "").localeCompare(b.city || "");
      case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "oldest": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      default: return a.name.localeCompare(b.name);
    }
  });


  const directoryList = (
    <div className="space-y-1">
      {sortedVendors.map((v) => (
        <button
          key={v.id}
          onClick={() => handleVendorClick(v)}
          className="w-full text-left px-3 py-2 rounded-md hover:bg-accent/50 transition-colors"
        >
          <p className="text-sm font-medium text-foreground">{v.name}</p>
          {v.city && <p className="text-xs text-muted-foreground">{v.city}</p>}
          {v.categories && v.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {v.categories.slice(0, 3).map((c) => (
                <span key={c} className="text-[10px] rounded-full bg-primary/10 px-1.5 py-0.5 text-primary">{t(`join.${c}`)}</span>
              ))}
            </div>
          )}
        </button>
      ))}
    </div>
  );

  const mapElement = (
    <MapContainer
      center={[51.1657, 10.4515]}
      zoom={6}
      className="w-full h-full"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {flyTarget && <FlyTo center={flyTarget.center} zoom={flyTarget.zoom} />}
      {vendors.map((v) => (
        <Marker key={v.id} position={[v.lat, v.lng]} icon={orangeIcon} ref={(ref) => { if (ref) markerRefs.current[v.id] = ref; }}>
          <Popup>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{v.name}</p>
              {v.city && <p className="text-muted-foreground">{v.city}</p>}
              {v.categories && v.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {v.categories.map((c) => (
                    <span key={c} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{t(`join.${c}`)}</span>
                  ))}
                </div>
              )}
              {v.website && (
                <a href={formatUrl(v.website)} target="_blank" rel="noopener noreferrer" className="text-primary text-xs font-medium hover:underline block">{v.website}</a>
              )}
              <div className="flex gap-2 pt-1">
                <a href={`/vendors/${v.slug || v.id}`} className="text-primary text-xs font-medium hover:underline">
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

  if (embed) return <div className="w-full h-screen">{mapElement}</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute top-3 right-3 z-[1000]">
        <LanguageSwitcher />
      </div>
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

      {/* Mobile directory toggle */}
      <div className="sm:hidden border-b">
        <button
          onClick={() => setShowDirectory(!showDirectory)}
          className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-foreground"
        >
          <span>{t("vendorMap.directory")} ({vendors.length})</span>
          {showDirectory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showDirectory && (
          <ScrollArea className="max-h-60 px-2 pb-2">
            {directoryList}
          </ScrollArea>
        )}
      </div>

      <div className="flex-1 flex">
        {/* Desktop sidebar */}
        <aside className="hidden sm:block w-72 border-r bg-background overflow-hidden flex-shrink-0">
          <div className="px-3 py-2 border-b">
            <h3 className="text-sm font-semibold text-foreground">{t("vendorMap.directory")} ({vendors.length})</h3>
          </div>
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-2">
              {directoryList}
            </div>
          </ScrollArea>
        </aside>
        <div className="flex-1 h-[calc(100vh-140px)] sm:h-[calc(100vh-140px)]">
          {mapElement}
        </div>
      </div>
    </div>
  );
};

export default VendorMapPage;
