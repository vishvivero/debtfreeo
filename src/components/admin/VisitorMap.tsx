import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { Tooltip } from "react-tooltip";

const geoUrl = "https://unpkg.com/world-atlas@2/countries-110m.json";

interface GeoData {
  latitude: number;
  longitude: number;
  country?: string;
  city?: string;
}

interface VisitorMapProps {
  geoData: GeoData[];
}

export const VisitorMap = ({ geoData }: VisitorMapProps) => {
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1.5 });

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleMoveEnd = (position: any) => {
    setPosition(position);
  };

  return (
    <div className="h-[300px] w-full rounded-lg relative">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="h-8 w-8 bg-white/90"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="h-8 w-8 bg-white/90"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>
      <ComposableMap
        projectionConfig={{
          scale: 147,
        }}
        className="w-full h-full"
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          maxZoom={4}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#EAEAEC"
                  stroke="#D6D6DA"
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: "#F5F5F5", outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>
          {geoData?.map((location, index) => (
            location.latitude && location.longitude ? (
              <Marker
                key={index}
                coordinates={[location.longitude, location.latitude]}
                data-tooltip-id="location-tooltip"
                data-tooltip-content={`${location.city || 'Unknown City'}, ${location.country || 'Unknown Country'}`}
              >
                <circle r={4} fill="#34D399" />
              </Marker>
            ) : null
          ))}
        </ZoomableGroup>
      </ComposableMap>
      <Tooltip id="location-tooltip" />
    </div>
  );
};