
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ingresosService } from '../services/ingresosService';
import { Donante } from '@/features/donantes/types/donantes.types';
import type { AddedItem } from '../components/AddItemSection';

export function useIngresoNormal() {
  const { user } = useAuth();
  
  // Donor State
  const [donorType, setDonorType] = useState<'persona' | 'empresa'>('persona');
  const [selectedDonor, setSelectedDonor] = useState<Donante | null>(null);
  const [newDonorName, setNewDonorName] = useState('');

  // Items State
  const [items, setItems] = useState<AddedItem[]>([]);
  
  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddItem = (item: AddedItem) => {
    setItems(prev => [...prev, item]);
  };

  const handleRemoveItem = (tempId: string) => {
    setItems(prev => prev.filter(i => i.tempId !== tempId));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Usuario no autenticado");
      return;
    }
    
    // Validations
    if (!selectedDonor && !newDonorName.trim()) {
      toast.error("Debe seleccionar un donante o ingresar uno nuevo");
      return;
    }
    
    if (items.length === 0) {
      toast.error("Debe agregar al menos un ítem");
      return;
    }

    setIsSubmitting(true);
    try {
      await ingresosService.registrarIngresoNormal(
        donorType,
        selectedDonor,
        newDonorName,
        items,
        user.id
      );
      
      toast.success("Ingreso registrado correctamente");
      
      // Reset form
      setItems([]);
      setSelectedDonor(null);
      setNewDonorName('');
      setDonorType('persona');
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al registrar el ingreso");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    donorType,
    setDonorType,
    selectedDonor,
    setSelectedDonor,
    newDonorName,
    setNewDonorName,
    items,
    handleAddItem,
    handleRemoveItem,
    handleSubmit,
    isSubmitting
  };
}
