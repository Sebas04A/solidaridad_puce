import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Database } from '@/types/database.types';

type BeneficiarioInsert = Database['public']['Tables']['beneficiarios']['Insert'];

interface BeneficiaryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newBeneficiaryId: number) => void;
}

interface FormData {
    nombre: string;
    sector: string;
    provincia: string;
    canton: string;
    parroquia: string;
    contacto_nombre: string;
    contacto_telefono: string;
    poblacion_estimada: string;
    notas: string;
}

const initialFormData: FormData = {
    nombre: '',
    sector: '',
    provincia: '',
    canton: '',
    parroquia: '',
    contacto_nombre: '',
    contacto_telefono: '',
    poblacion_estimada: '',
    notas: '',
};

export function BeneficiaryFormModal({ isOpen, onClose, onSuccess }: BeneficiaryFormModalProps) {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<FormData>>({});

    const handleChange = (field: keyof FormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<FormData> = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }

        if (formData.poblacion_estimada && isNaN(Number(formData.poblacion_estimada))) {
            newErrors.poblacion_estimada = 'Debe ser un número válido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);

        try {
            const insertData: BeneficiarioInsert = {
                nombre: formData.nombre.trim(),
                sector: formData.sector.trim() || null,
                provincia: formData.provincia.trim() || null,
                canton: formData.canton.trim() || null,
                parroquia: formData.parroquia.trim() || null,
                contacto_nombre: formData.contacto_nombre.trim() || null,
                contacto_telefono: formData.contacto_telefono.trim() || null,
                poblacion_estimada: formData.poblacion_estimada ? Number(formData.poblacion_estimada) : null,
                notas: formData.notas.trim() || null,
            };

            const { data, error } = await supabase
                .from('beneficiarios')
                .insert(insertData as any)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error('No data returned');

            const beneficiaryId = (data as { id: number }).id;
            toast.success('Beneficiario creado exitosamente');
            setFormData(initialFormData);
            onSuccess(beneficiaryId);
            onClose();
        } catch (error) {
            console.error('Error creating beneficiary:', error);
            toast.error('Error al crear el beneficiario');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData(initialFormData);
        setErrors({});
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Nuevo Beneficiario" size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Header info */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-700">
                        Registre una nueva comunidad u organización que recibirá ayuda humanitaria.
                    </p>
                </div>

                {/* Nombre - Required */}
                <Input
                    label="Nombre de la Organización / Comunidad *"
                    placeholder="Ej. Comunidad San Pedro"
                    value={formData.nombre}
                    onChange={handleChange('nombre')}
                    error={errors.nombre}
                />

                {/* Location Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Provincia"
                        placeholder="Ej. Pichincha"
                        value={formData.provincia}
                        onChange={handleChange('provincia')}
                    />
                    <Input
                        label="Cantón"
                        placeholder="Ej. Quito"
                        value={formData.canton}
                        onChange={handleChange('canton')}
                    />
                    <Input
                        label="Parroquia"
                        placeholder="Ej. La Libertad"
                        value={formData.parroquia}
                        onChange={handleChange('parroquia')}
                    />
                    <Input
                        label="Sector"
                        placeholder="Ej. Sector Norte"
                        value={formData.sector}
                        onChange={handleChange('sector')}
                    />
                </div>

                {/* Contact Info */}
                <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Información de Contacto</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nombre del Contacto"
                            placeholder="Ej. Juan Pérez"
                            value={formData.contacto_nombre}
                            onChange={handleChange('contacto_nombre')}
                        />
                        <Input
                            label="Teléfono"
                            placeholder="Ej. 0991234567"
                            value={formData.contacto_telefono}
                            onChange={handleChange('contacto_telefono')}
                        />
                    </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Población Estimada"
                        type="number"
                        placeholder="Ej. 500"
                        value={formData.poblacion_estimada}
                        onChange={handleChange('poblacion_estimada')}
                        error={errors.poblacion_estimada}
                    />
                </div>

                {/* Notas */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas Adicionales
                    </label>
                    <textarea
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Información adicional sobre el beneficiario..."
                        value={formData.notas}
                        onChange={handleChange('notas')}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="ghost" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar Beneficiario'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
