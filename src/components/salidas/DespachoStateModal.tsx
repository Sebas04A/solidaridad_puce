import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Truck, CheckCircle, Package } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    despacho: {
        id: number;
        codigo: string;
        estado: string;
    } | null;
    onSuccess: () => void;
}

// Use valid estados from database schema
const ESTADOS = [
    { value: 'validado', label: 'Validado', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { value: 'despachado', label: 'Despachado', icon: Truck, color: 'bg-blue-100 text-blue-700' },
    { value: 'rectificado', label: 'Rectificado', icon: Package, color: 'bg-orange-100 text-orange-700' },
];

const estadoLabelMap: Record<string, string> = {
    preparando: 'Preparando',
    validado: 'Validado',
    despachado: 'Despachado',
    rectificado: 'Rectificado',
};

export const DespachoStateModal: React.FC<Props> = ({ isOpen, onClose, despacho, onSuccess }) => {
    const [selectedState, setSelectedState] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen && despacho) {
            setSelectedState('');
        }
    }, [isOpen, despacho]);

    const handleSubmit = async () => {
        if (!despacho || !selectedState) return;

        setIsLoading(true);
        try {
            // Update despacho state
            const { error } = await (supabase.from('despachos') as any)
                .update({ estado: selectedState })
                .eq('id', despacho.id);

            if (error) {
                console.error('Error updating state:', error);
                toast.error('Error al actualizar el estado');
            } else {
                toast.success(`Estado actualizado a "${ESTADOS.find(e => e.value === selectedState)?.label}"`);
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error updating state:', error);
            toast.error('Error al actualizar el estado');
        } finally {
            setIsLoading(false);
        }
    };

    if (!despacho) return null;

    // Filter out the current state from options
    const availableStates = ESTADOS.filter(e => e.value !== despacho.estado);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Cambiar Estado - ${despacho.codigo}`} size="md">
            <div className="space-y-6">
                <div>
                    <p className="text-sm text-gray-500 mb-2">Estado actual:</p>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                        {estadoLabelMap[despacho.estado] || despacho.estado}
                    </span>
                </div>

                <div>
                    <p className="text-sm text-gray-600 mb-3">Seleccione el nuevo estado:</p>
                    <div className="grid grid-cols-3 gap-3">
                        {availableStates.map((estado) => {
                            const Icon = estado.icon;
                            const isSelected = selectedState === estado.value;
                            return (
                                <button
                                    key={estado.value}
                                    type="button"
                                    onClick={() => setSelectedState(estado.value)}
                                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                    ${isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className={`p-2 rounded-full ${estado.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                        {estado.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={!selectedState || isLoading}
                    >
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
