
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

// Use a direct URL to the TopoJSON file
const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

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
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

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

  // Memoize filtered data
  const validLocations = useMemo(() => 
    geoData?.filter(location => 
      location.latitude && 
      location.longitude && 
      !isNaN(location.latitude) && 
      !isNaN(location.longitude)
    ) || [], 
    [geoData]
  );

  // If no geoData is provided, show a message
  if (!validLocations.length) {
    return (
      <div className="h-[300px] w-full rounded-lg bg-gray-50 flex items-center justify-center">
        <p className="text-muted-foreground">No visitor location data available</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full rounded-lg relative bg-gray-50">
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
          scale: 140,
          center: [0, 0],
        }}
        className="w-full h-full"
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          maxZoom={4}
          minZoom={1}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#EAEAEC"
                  stroke="#D6D6DA"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: "#F5F5F5", outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>
          {validLocations.map((location, index) => (
            <Marker
              key={index}
              coordinates={[location.longitude, location.latitude]}
              data-tooltip-id="location-tooltip"
              data-tooltip-content={`${location.city || 'Unknown City'}, ${location.country || 'Unknown Country'}`}
            >
              <circle 
                r={4} 
                fill="#34D399" 
                stroke="#fff"
                strokeWidth={1}
                style={{
                  cursor: 'pointer',
                  filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.1))'
                }}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
      <Tooltip 
        id="location-tooltip"
        className="z-50"
        style={{
          backgroundColor: "white",
          color: "black",
          padding: "5px 10px",
          borderRadius: "4px",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          fontSize: "12px"
        }}
      />
    </div>
  );
};
