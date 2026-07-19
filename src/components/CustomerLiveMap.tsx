import React, { useState, useMemo } from "react";
import { MapPin, Info, Settings, Compass, Layers, Sparkles, Navigation, Globe } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { CustomerLocation } from "../types";

interface CustomerLiveMapProps {
  locations: CustomerLocation[];
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

// Check for Google Maps API Key
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";

const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY";

// Accra Bounding Box for Fallback Vector Map
const ACCRA_BOUNDS = {
  minLat: 5.54,
  maxLat: 5.65,
  minLng: -0.32,
  maxLng: -0.15,
};

// Neighborhood reference points to make fallback map realistic
const ACCRA_ZONES = [
  { name: "Ashaiman", x: 45, y: 35, desc: "Active hub, near Ashaiman Market" },
  { name: "Achimota", x: 55, y: 25, desc: "Achimota Forest Area" },
  { name: "Dansoman", x: 25, y: 70, desc: "Dansoman Exhibition Zone" },
  { name: "East Legon", x: 80, y: 30, desc: "Upscale residential & commercial" },
  { name: "Accra Central", x: 50, y: 85, desc: "Makola & Coastal regions" },
  { name: "Kaneshie", x: 38, y: 55, desc: "Kaneshie Market transit corridor" },
];

export default function CustomerLiveMap({ locations, onShowToast }: CustomerLiveMapProps) {
  const [mapMode, setMapMode] = useState<"vector" | "google">(hasValidKey ? "google" : "vector");
  const [selectedPin, setSelectedPin] = useState<CustomerLocation | null>(null);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  // Convert Lat/Lng to Vector Percentage X/Y for Accra Bounding Box
  const getXY = (lat: number, lng: number) => {
    const latRange = ACCRA_BOUNDS.maxLat - ACCRA_BOUNDS.minLat;
    const lngRange = ACCRA_BOUNDS.maxLng - ACCRA_BOUNDS.minLng;

    // Standard bounding box percentage
    let x = ((lng - ACCRA_BOUNDS.minLng) / lngRange) * 100;
    // Invert Y since 0 is top
    let y = 100 - ((lat - ACCRA_BOUNDS.minLat) / latRange) * 100;

    // Clamp values
    x = Math.max(5, Math.min(95, x));
    y = Math.max(5, Math.min(95, y));

    return { x, y };
  };

  const formattedPins = useMemo(() => {
    return locations.map((loc) => {
      const { x, y } = getXY(loc.lat, loc.lng);
      return {
        ...loc,
        x,
        y,
      };
    });
  }, [locations]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col text-white" id="logistics-map-wrapper">
      {/* Map Control Bar */}
      <div className="bg-slate-950 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-850">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Compass className="w-5 h-5 text-indigo-400 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-black tracking-widest text-slate-100 uppercase flex items-center gap-1.5">
              Accra Logistics GPS Grid <span className="text-[10px] bg-indigo-500 text-white font-mono px-2 py-0.5 rounded font-black tracking-normal">Live</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Plotting {locations.length} customer coordinate points
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setMapMode("vector");
              onShowToast("Map Mode", "Switched to Accra Vector Logistics Board", "info");
            }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-1 cursor-pointer ${
              mapMode === "vector"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className="w-3 h-3" />
            Vector Grid
          </button>
          <button
            onClick={() => {
              if (!hasValidKey) {
                setShowConfigGuide(true);
                onShowToast("API Key Needed", "Google Maps API Key required to run satellite mode.", "error");
              } else {
                setMapMode("google");
                onShowToast("Map Mode", "Google Maps live satellite routing loaded", "success");
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-1 cursor-pointer ${
              mapMode === "google"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-3 h-3" />
            Google Maps
          </button>
        </div>
      </div>

      {/* Map Content Section */}
      <div className="relative h-[420px] bg-slate-950 flex-1 overflow-hidden">
        {mapMode === "vector" ? (
          /* HIGH QUALITY SVG fall-back / Accra logistics map board */
          <div className="absolute inset-0 select-none relative bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center">
            
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />

            {/* Bounding limits indicators */}
            <div className="absolute top-2 left-3 font-mono text-[8px] text-slate-500">Accra North Bounds: {ACCRA_BOUNDS.maxLat}°N, {ACCRA_BOUNDS.minLng}°W</div>
            <div className="absolute bottom-2 right-3 font-mono text-[8px] text-slate-500">Accra South Bounds: {ACCRA_BOUNDS.minLat}°N, {ACCRA_BOUNDS.maxLng}°W</div>

            {/* Custom stylized Accra roads & boundaries background */}
            <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
              {/* Outer boundary */}
              <rect x="2%" y="2%" width="96%" height="96%" rx="12" fill="none" stroke="#312e81" strokeWidth="1" strokeDasharray="4 4" />
              
              {/* Major Highway overlays (N1 / George Walker Bush Hwy, Ring Road, Liberation Road) */}
              <path d="M 5 40 Q 50 35 95 45" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeDasharray="3 3" />
              <path d="M 45 5 Q 50 50 55 95" fill="none" stroke="#4f46e5" strokeWidth="1.5" />
              <path d="M 10 75 Q 40 50 85 25" fill="none" stroke="#1e1b4b" strokeWidth="3" />

              {/* Transit coordinate lines */}
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#1e293b" strokeWidth="0.5" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#1e293b" strokeWidth="0.5" />
            </svg>

            {/* Accra Zones */}
            {ACCRA_ZONES.map((zone) => (
              <div
                key={zone.name}
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                onMouseEnter={() => setActiveZone(zone.name)}
                onMouseLeave={() => setActiveZone(null)}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700/80 border border-slate-600 transition-transform group-hover:scale-150" />
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1 font-mono transition-colors group-hover:text-indigo-400">
                  {zone.name}
                </span>
              </div>
            ))}

            {/* Plot Customer Pins */}
            {formattedPins.map((pin) => (
              <button
                key={pin.id}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                onClick={() => setSelectedPin(pin)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group z-10 cursor-pointer"
                title={`${pin.customerName} Delivery`}
              >
                {/* Glowing ring animation */}
                <span className="absolute -inset-2 rounded-full bg-indigo-500/20 animate-ping group-hover:bg-indigo-400/30" />
                
                {/* Visual Pin wrapper */}
                <div className="relative p-1.5 bg-slate-900 border-2 border-indigo-500 rounded-full text-indigo-400 group-hover:text-white group-hover:bg-indigo-600 group-hover:border-white transition-all shadow-lg shadow-indigo-500/20">
                  <MapPin className="w-3.5 h-3.5" />
                </div>

                {/* Micro tooltip label */}
                <span className="absolute left-1/2 -translate-x-1/2 -top-6 bg-slate-950 text-white border border-slate-800 text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {pin.customerName}
                </span>
              </button>
            ))}

            {/* Dynamic Vector Info Popover */}
            {selectedPin && (
              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/95 border border-slate-850 p-4 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300 z-20 flex gap-4 items-start max-w-lg">
                <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400 shrink-0">
                  <Navigation className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider font-sans">
                      {selectedPin.customerName} <span className="text-[9px] text-indigo-400 font-mono lowercase">(customer profile)</span>
                    </h4>
                    <button
                      onClick={() => setSelectedPin(null)}
                      className="text-slate-500 hover:text-white text-xs cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">{selectedPin.address}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-mono text-slate-500 pt-1.5 border-t border-slate-900">
                    <span>LAT: {(selectedPin.lat || 0).toFixed(4)}°N</span>
                    <span>LNG: {(selectedPin.lng || 0).toFixed(4)}°W</span>
                    <span>STATUS: Active Dispatch Route</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* GOOGLE MAP MODE */
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={{ lat: 5.6037, lng: -0.2270 }} // Center of Accra
              defaultZoom={12}
              mapId="ELLAS_STORE_LOGISTICS_MAP"
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              style={{ width: "100%", height: "100%" }}
            >
              {locations.map((pin) => (
                <AdvancedMarker
                  key={pin.id}
                  position={{ lat: pin.lat, lng: pin.lng }}
                  onClick={() => setSelectedPin(pin)}
                >
                  <Pin background="#4f46e5" borderColor="#ffffff" glyphColor="#ffffff">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </Pin>
                </AdvancedMarker>
              ))}

              {selectedPin && (
                <InfoWindow
                  position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
                  onCloseClick={() => setSelectedPin(null)}
                >
                  <div className="p-2.5 text-slate-900 space-y-1.5 max-w-xs font-sans">
                    <div className="flex items-center gap-1.5 border-b border-neutral-100 dark:border-slate-800 pb-1">
                      <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                      <strong className="text-xs font-black text-slate-800 uppercase tracking-tight">
                        {selectedPin.customerName}
                      </strong>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      {selectedPin.address}
                    </p>
                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 pt-1">
                      <span>{(selectedPin.lat || 0).toFixed(4)}°N, {(selectedPin.lng || 0).toFixed(4)}°W</span>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        )}

        {/* API Key Config Modal/Guide Overlay */}
        {showConfigGuide && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md p-6 flex items-center justify-center z-30 animate-in fade-in duration-300">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                    <Settings className="w-5 h-5 animate-spin-slow" />
                  </div>
                  <h4 className="font-sans font-black text-sm tracking-wider uppercase text-white">
                    Google Maps API Key Setup
                  </h4>
                </div>
                <button
                  onClick={() => setShowConfigGuide(false)}
                  className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
                <p>
                  To display highly accurate Google Maps satellite terrain, street overlays, and real-time transit paths, complete these simple configuration steps:
                </p>
                <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 space-y-2.5 text-[10px] font-mono text-indigo-300">
                  <p>
                    <strong>1. Acquire an API Key:</strong>
                    <br />
                    <a
                      href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 underline hover:text-amber-300"
                    >
                      Google Maps Developer Portal
                    </a>
                  </p>
                  <p>
                    <strong>2. Register as AI Studio Secret:</strong>
                    <br />
                    Click <strong>Settings</strong> (⚙️ gear, top-right) → <strong>Secrets</strong> → Key: <code>GOOGLE_MAPS_PLATFORM_KEY</code> → Value: [Your Key] → Enter.
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  Note: The application will automatically compile and hot-rebuild to inject the credentials.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accra neighborhoods stats bar */}
      <div className="bg-slate-950 px-6 py-4 border-t border-slate-850 flex flex-wrap justify-between items-center gap-3 text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Accra Hub covers: Ashaiman, Achimota, Dansoman, East Legon, Coastal Accra
        </span>
        <button
          onClick={() => {
            setMapMode(mapMode === "vector" ? "google" : "vector");
            onShowToast("Toggle Map", "Rotated active logistics overlay", "info");
          }}
          className="text-indigo-400 hover:text-indigo-300 text-[10px] font-bold tracking-widest uppercase cursor-pointer"
        >
          Toggle Overlay
        </button>
      </div>
    </div>
  );
}
