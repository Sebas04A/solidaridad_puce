
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { triajeService } from '../services/triajeService';
import { TriajeList } from '../components/TriajeList';
import type { TriajeItem } from '../types/triaje.types';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function TriajeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<TriajeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [user]);

  const loadItems = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await triajeService.getPendingItems();
      setItems(data);
    } catch (error) {
      console.error(error);
      toast.error('Error cargando bultos pendientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcess = (item: TriajeItem) => {
    navigate(`/triaje/${item.ingreso_id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Triaje y Clasificación</h1>
           <p className="text-gray-500">Procesa los bultos de emergencia y clasifica los ítems para inventario.</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <TriajeList items={items} onProcess={handleProcess} />
      )}
    </div>
  );
}
