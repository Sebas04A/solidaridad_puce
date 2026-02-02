import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Upload, X, Truck, CheckCircle, XCircle } from 'lucide-react';

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

const ESTADOS = [
    { value: 'en_camino', label: 'En Camino', icon: Truck, color: 'bg-blue-100 text-blue-700' },
    { value: 'completado', label: 'Completado', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { value: 'cancelado', label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-700' },
];

export const DespachoStateModal: React.FC<Props> = ({ isOpen, onClose, despacho, onSuccess }) => {
    const [selectedState, setSelectedState] = useState<string>('');
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen && despacho) {
            setSelectedState('');
            setEvidenceFile(null);
            setEvidencePreview(null);
        }
    }, [isOpen, despacho]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEvidenceFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setEvidencePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeEvidence = () => {
        setEvidenceFile(null);
        setEvidencePreview(null);
    };

    const handleSubmit = async () => {
        if (!despacho || !selectedState) return;

        // Require evidence for completed state
        if (selectedState === 'completado' && !evidenceFile) {
            toast.error('Debe adjuntar evidencia fotográfica para completar el despacho');
            return;
        }

        setIsLoading(true);
        try {
            let evidenceUrl = null;

            // Upload evidence if provided
            if (evidenceFile && selectedState === 'completado') {
                const fileExt = evidenceFile.name.split('.').pop();
                const fileName = `despacho_${despacho.id}_${Date.now()}.${fileExt}`;
                const filePath = `evidencias/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('evidencias')
                    .upload(filePath, evidenceFile);

                if (uploadError) {
                    console.error('Error uploading evidence:', uploadError);
                    // Continue anyway, the state change is still valid
                } else {
                    const { data: { publicUrl } } = supabase.storage
                        .from('evidencias')
                        .getPublicUrl(filePath);
                    evidenceUrl = publicUrl;
                }
            }

            // Update despacho state
            const updateData: Record<string, any> = {
                estado: selectedState,
            };

            if (evidenceUrl) {
                updateData.evidencia_url = evidenceUrl;
            }

            if (selectedState === 'completado') {
                updateData.fecha_entrega = new Date().toISOString();
            }

            await (supabase.from('despachos') as any).update(updateData).eq('id', despacho.id);

            toast.success(`Estado actualizado a "${ESTADOS.find(e => e.value === selectedState)?.label}"`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating state:', error);
            toast.error('Error al actualizar el estado');
        } finally {
            setIsLoading(false);
        }
    };

    if (!despacho) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Cambiar Estado - ${despacho.codigo}`} size="md">
            <div className="space-y-6">
                <div>
                    <p className="text-sm text-gray-500 mb-2">Estado actual:</p>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                        {despacho.estado}
                    </span>
                </div>

                <div>
                    <p className="text-sm text-gray-600 mb-3">Seleccione el nuevo estado:</p>
                    <div className="grid grid-cols-3 gap-3">
                        {ESTADOS.map((estado) => {
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

                {/* Evidence upload - only for completed state */}
                {selectedState === 'completado' && (
                    <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Evidencia Fotográfica <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                            Adjunte una foto que demuestre la entrega del despacho al beneficiario.
                        </p>

                        {!evidencePreview ? (
                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                    <p className="text-sm text-gray-500">
                                        <span className="font-semibold text-blue-600">Subir foto</span> o arrastrar aquí
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG hasta 10MB</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        ) : (
                            <div className="relative">
                                <img
                                    src={evidencePreview}
                                    alt="Evidencia"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={removeEvidence}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={!selectedState || isLoading || (selectedState === 'completado' && !evidenceFile)}
                    >
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
