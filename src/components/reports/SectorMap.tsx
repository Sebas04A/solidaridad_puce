
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/Card';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with React
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface BeneficiaryLocation {
  id: number;
  nombre: string;
  lat: number;
  lng: number;
  sector: string | null;
  despachos_count?: number; // Approximate count for demo if not using complex join
  total_ayuda?: number;
}

const QUITO_CENTER: [number, number] = [-0.22985, -78.52495]; // Center of Quito

export function SectorMap() {
  const [locations, setLocations] = useState<BeneficiaryLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch beneficiaries with lat/lng
      // Note: In real app, we would join with desptaches to get accurate aggregations
      const { data, error } = await supabase
        .from('beneficiarios')
        .select('*')
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (!error && data) {
        // Mocking aggregation data for visual purposes if not yet available in DB view
        const enrichedData = data.map((b: any) => ({
            ...b,
            despachos_count: Math.floor(Math.random() * 10) + 1,
            total_ayuda: (Math.floor(Math.random() * 500) + 50) * 10
        }));
        setLocations(enrichedData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-white">
      <CardContent className="p-0">
        <div className="h-[400px] w-full z-0 relative">
            {!loading && (
             <MapContainer 
                center={QUITO_CENTER} 
                zoom={12} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%', zIndex: 10 }}
             >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {locations.map((loc) => (
                  <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                    <Popup>
                      <div className="p-1">
                        <div className="flex items-center gap-2 mb-2">
                             <MapPin className="text-red-500 w-4 h-4" />
                             <h3 className="font-bold text-gray-800 text-sm">{loc.nombre}</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">Sector: {loc.sector || 'N/A'}</p>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100 mt-2">
                            <p className="text-xs text-gray-700"><strong>Despachos:</strong> {loc.despachos_count}</p>
                            <p className="text-xs text-gray-700"><strong>Ayuda Total:</strong> ${loc.total_ayuda?.toLocaleString()}</p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
