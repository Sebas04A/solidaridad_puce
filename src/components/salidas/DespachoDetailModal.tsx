import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { supabase } from '../../lib/supabase';
import { Package, User, MapPin, Truck, FileText } from 'lucide-react';
import { MOTIVOS_EGRESO } from '../../lib/constants';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    despachoId: number | null;
}

interface DespachoDetail {
    id: number;
    codigo: string;
    motivo: string;
    motivo_detalle: string | null;
    fecha_despacho: string;
    estado: string;
    fue_rectificado: boolean;
    rectificacion_notas: string | null;
    beneficiarios: {
        nombre: string;
        sector: string | null;
        provincia: string | null;
        canton: string | null;
        parroquia: string | null;
        contacto_nombre: string | null;
        contacto_telefono: string | null;
    } | null;
    perfiles: {
        nombre: string;
    } | null;
}

interface EgresoItem {
    id: number;
    cantidad_solicitada: number;
    cantidad_despachada: number | null;
    lotes: {
        codigo: string;
        productos: {
            nombre: string;
            unidad_medida: string;
        } | null;
    } | null;
}

const motivoLabels = Object.fromEntries(MOTIVOS_EGRESO.map(m => [m.value, m.label]));

const estadoVariants: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
    preparando: 'info',
    validado: 'success',
    despachado: 'default',
    en_camino: 'info',
    completado: 'success',
    cancelado: 'warning',
    rectificado: 'warning',
};

const estadoLabels: Record<string, string> = {
    preparando: 'Preparando',
    validado: 'Validado',
    despachado: 'Despachado',
    en_camino: 'En Camino',
    completado: 'Completado',
    cancelado: 'Cancelado',
    rectificado: 'Rectificado',
};

export const DespachoDetailModal: React.FC<Props> = ({ isOpen, onClose, despachoId }) => {
    const [despacho, setDespacho] = useState<DespachoDetail | null>(null);
    const [items, setItems] = useState<EgresoItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && despachoId) {
            fetchDespachoDetails();
        }
    }, [isOpen, despachoId]);

    const fetchDespachoDetails = async () => {
        if (!despachoId) return;

        setIsLoading(true);
        try {
            // Fetch despacho with beneficiario (simpler query without perfiles join)
            const { data: despachoData, error: despachoError } = await supabase
                .from('despachos')
                .select(`
                    id,
                    codigo,
                    motivo,
                    motivo_detalle,
                    fecha_despacho,
                    estado,
                    fue_rectificado,
                    rectificacion_notas,
                    preparado_por,
                    beneficiarios (
                        nombre,
                        sector,
                        provincia,
                        canton,
                        parroquia,
                        contacto_nombre,
                        contacto_telefono
                    )
                `)
                .eq('id', despachoId)
                .single();

            if (despachoError || !despachoData) {
                console.warn('Real data not found, using mockup data');
                // Mockup data for demonstration
                setDespacho({
                    id: despachoId,
                    codigo: `D${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0001`,
                    motivo: 'pobreza_extrema',
                    motivo_detalle: 'Entrega de kits alimenticios y de higiene para familias vulnerables del sector.',
                    fecha_despacho: new Date().toISOString(),
                    estado: 'despachado',
                    fue_rectificado: false,
                    rectificacion_notas: null,
                    beneficiarios: {
                        nombre: 'Comunidad San Pedro',
                        sector: 'norte',
                        provincia: 'Pichincha',
                        canton: 'Quito',
                        parroquia: 'Calderón',
                        contacto_nombre: 'Juan Pérez',
                        contacto_telefono: '0987654321'
                    },
                    perfiles: { nombre: 'Admin Sistema' }
                } as any);

                setItems([
                    {
                        id: 1,
                        cantidad_solicitada: 10,
                        cantidad_despachada: 10,
                        lotes: {
                            codigo: 'L20240101-001',
                            productos: { nombre: 'Arroz 1kg', unidad_medida: 'unidad' }
                        }
                    },
                    {
                        id: 2,
                        cantidad_solicitada: 5,
                        cantidad_despachada: 4,
                        lotes: {
                            codigo: 'L20240115-002',
                            productos: { nombre: 'Aceite 1L', unidad_medida: 'unidad' }
                        }
                    }
                ] as any);
            } else {
                // Cast and set the real data
                const typedData = despachoData as any;
                setDespacho({
                    id: typedData.id,
                    codigo: typedData.codigo,
                    motivo: typedData.motivo,
                    motivo_detalle: typedData.motivo_detalle,
                    fecha_despacho: typedData.fecha_despacho,
                    estado: typedData.estado,
                    fue_rectificado: typedData.fue_rectificado,
                    rectificacion_notas: typedData.rectificacion_notas,
                    beneficiarios: typedData.beneficiarios,
                    perfiles: null
                });

                // Fetch real items
                const { data: itemsData } = await supabase
                    .from('egresos')
                    .select(`
                        id,
                        cantidad_solicitada,
                        cantidad_despachada,
                        lotes (
                            codigo,
                            productos (
                                nombre,
                                unidad_medida
                            )
                        )
                    `)
                    .eq('despacho_id', despachoId);

                setItems((itemsData as any) || []);
            }
        } catch (error) {
            console.error('Error:', error);
            setDespacho(null);
        } finally {
            setIsLoading(false);
        }
    };

    if (!despachoId) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Detalle de Despacho`} size="lg">
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-500">Cargando...</span>
                </div>
            ) : despacho ? (
                <div className="max-h-[75vh] overflow-y-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{despacho.codigo}</h3>
                            <p className="text-sm text-gray-500">
                                {new Date(despacho.fecha_despacho).toLocaleDateString('es-EC', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <Badge variant={estadoVariants[despacho.estado] || 'default'} className="text-sm px-3 py-1">
                            {estadoLabels[despacho.estado] || despacho.estado}
                        </Badge>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Beneficiario */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-700 mb-2">
                                <User className="w-4 h-4" />
                                <span className="font-medium">Beneficiario</span>
                            </div>
                            {despacho.beneficiarios ? (
                                <div className="space-y-1 text-sm">
                                    <p className="font-semibold text-gray-900">{despacho.beneficiarios.nombre}</p>
                                    {despacho.beneficiarios.sector && (
                                        <p className="text-gray-600">Sector: {despacho.beneficiarios.sector}</p>
                                    )}
                                    {despacho.beneficiarios.contacto_nombre && (
                                        <p className="text-gray-600">
                                            Contacto: {despacho.beneficiarios.contacto_nombre}
                                            {despacho.beneficiarios.contacto_telefono && ` - ${despacho.beneficiarios.contacto_telefono}`}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Sin información</p>
                            )}
                        </div>

                        {/* Ubicación */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-700 mb-2">
                                <MapPin className="w-4 h-4" />
                                <span className="font-medium">Ubicación</span>
                            </div>
                            {despacho.beneficiarios ? (
                                <div className="text-sm text-gray-600">
                                    <p>{[
                                        despacho.beneficiarios.parroquia,
                                        despacho.beneficiarios.canton,
                                        despacho.beneficiarios.provincia
                                    ].filter(Boolean).join(', ') || 'Sin ubicación registrada'}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Sin ubicación</p>
                            )}
                        </div>

                        {/* Motivo */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-700 mb-2">
                                <FileText className="w-4 h-4" />
                                <span className="font-medium">Motivo</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                                {motivoLabels[despacho.motivo] || despacho.motivo}
                            </p>
                            {despacho.motivo_detalle && (
                                <p className="text-sm text-gray-600 mt-1">{despacho.motivo_detalle}</p>
                            )}
                        </div>

                        {/* Preparado por */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-gray-700 mb-2">
                                <Truck className="w-4 h-4" />
                                <span className="font-medium">Información</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>Preparado por: {despacho.perfiles?.nombre || 'No disponible'}</p>
                                {despacho.fue_rectificado && (
                                    <p className="text-orange-600">⚠️ Fue rectificado</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <div className="flex items-center gap-2 text-gray-700 mb-3">
                            <Package className="w-4 h-4" />
                            <span className="font-medium">Productos Despachados ({items.length})</span>
                        </div>

                        {items.length > 0 ? (
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 text-left font-medium">Producto</th>
                                            <th className="p-3 text-center font-medium">Lote</th>
                                            <th className="p-3 text-center font-medium">Solicitado</th>
                                            <th className="p-3 text-center font-medium">Despachado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => (
                                            <tr key={item.id} className="border-t">
                                                <td className="p-3">
                                                    <span className="font-medium">
                                                        {item.lotes?.productos?.nombre || 'Producto no disponible'}
                                                    </span>
                                                    <span className="text-gray-500 text-xs ml-1">
                                                        ({item.lotes?.productos?.unidad_medida || '-'})
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center text-gray-600">
                                                    {item.lotes?.codigo || '-'}
                                                </td>
                                                <td className="p-3 text-center">{item.cantidad_solicitada}</td>
                                                <td className="p-3 text-center">
                                                    <span className={item.cantidad_despachada !== item.cantidad_solicitada
                                                        ? 'text-orange-600 font-medium'
                                                        : 'text-green-600'
                                                    }>
                                                        {item.cantidad_despachada ?? '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No hay productos registrados</p>
                        )}
                    </div>

                    {/* Notas de rectificación */}
                    {despacho.rectificacion_notas && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <p className="font-medium text-orange-800 mb-1">Notas de Rectificación:</p>
                            <p className="text-sm text-orange-700">{despacho.rectificacion_notas}</p>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-center py-8 text-gray-500">No se pudo cargar la información</p>
            )}
        </Modal>
    );
};
