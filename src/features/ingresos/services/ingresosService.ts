
import { supabase } from '@/lib/supabase';
import { donantesService } from '@/features/donantes/services/donantesService';
import type { Donante } from '@/features/donantes/types/donantes.types';
import type { AddedItem } from '../components/AddItemSection';

export const ingresosService = {
  /**
   * Orchestrates the full Ingreso Normal:
   * 1. Get or Create Donor.
   * 2. Loop items -> Create Lote -> Create Ingreso.
   * Note: This is client-side orchestration. If one fails mid-way, it might leave partial data. 
   * Ideally this should be a Supabase RPC, but for this prototype we do it here.
   */
  async registrarIngresoNormal(
    donorType: 'persona' | 'empresa',
    selectedDonor: Donante | null,
    newDonorName: string,
    items: AddedItem[],
    userId: string
  ) {
    if (items.length === 0) throw new Error("No hay ítems para registrar");

    // 1. Resolve Donor
    let finalDonorId: number | null = null;
    
    if (selectedDonor) {
      finalDonorId = selectedDonor.id;
    } else if (newDonorName.trim()) {
      // Create new donor
      const newDonor = await donantesService.create({
        nombre: newDonorName.trim(),
        tipo: donorType,
        es_anonimo: false
      });
      finalDonorId = newDonor.id;
    } else {
      throw new Error("Se requiere un donante");
    }

    // 2. Process Items using RPC
    const results: any[] = [];
    
    for (const item of items) {
       // Call RPC for each item
       // @ts-ignore
       const { data, error } = await supabase.rpc('registrar_ingreso_producto', {
         p_producto_id: item.producto.id,
         p_cantidad: item.cantidad,
         p_fecha_ingreso: item.fechaDonacion || new Date().toISOString().split('T')[0],
         p_fecha_caducidad: item.fechaVencimiento || null,
         p_donante_id: finalDonorId,
         p_usuario_id: userId,
         p_precio_unitario: item.precio
       });

       if (error) {
         console.error("Error in RPC registrar_ingreso_producto", error);
         throw error;
       }
       results.push(data);
    }

    return results;
  },

  async registrarCrisis(
    donorName: string,
    fechaIngreso: string,
    tipoMedida: 'bultos' | 'peso',
    cantidad: number,
    notas: string,
    userId: string
  ) {
    // 1. Resolve Generic Product (Donación por Clasificar)
    // We try to find it, or create it if missing.
    const GENERIC_PRODUCT_NAME = 'DONACIÓN POR CLASIFICAR';
    
    let { data: product } = await supabase
      .from('productos')
      .select('id')
      .eq('nombre', GENERIC_PRODUCT_NAME)
      .single();

    if (!product) {
      // Create on the fly
      const { data: newProd, error: prodError } = await supabase
        .from('productos')
        .insert({
          nombre: GENERIC_PRODUCT_NAME,
          categoria: 'otros', // Generic category
          clima: 'ambos',
          unidad_medida: 'unidad', // Default unit, though logic uses bultos/kg
          precio_referencial: 0,
          descripcion: 'Producto genérico para ingresos masivos sin clasificar',
          activo: true
        } as any)
        .select()
        .single();
      
      if (prodError) throw prodError;
      product = newProd;
    }

    // 2. Resolve Donor (Optional or Anonymous)
    let donorId: number | null = null;
    if (donorName && donorName.trim()) {
      // Check if exists or create
      // For simplicity in crisis, we just create/get by name
      // Logic duplicated from Normal, could refactor.
      const { data: existingDonor } = await supabase
        .from('donantes')
        .select('id')
        .ilike('nombre', donorName.trim())
        .maybeSingle();

      if (existingDonor) {
        // @ts-ignore
        donorId = existingDonor.id;
      } else {
         const { data: newDonor, error: donorError } = await supabase
          .from('donantes')
          .insert({ 
            nombre: donorName.trim(), 
            tipo: 'anonimo', // Default for quick entry
            es_anonimo: true 
          } as any)
          .select()
          .single();
         if (donorError) throw donorError;
         // @ts-ignore
         donorId = newDonor.id;
      }
    }

    // 3. Create Lote (Triaje Pendiente)
    // @ts-ignore
    const { data: lote, error: loteError } = await supabase
      .from('lotes')
      .insert({
        // @ts-ignore
        producto_id: product.id,
        donante_id: donorId,
        cantidad_inicial: cantidad,
        cantidad_actual: cantidad,
        estado: 'triaje_pendiente',
        fecha_ingreso: fechaIngreso, // User provided date
        notas: notas
      } as any)
      .select()
      .single();

    if (loteError) throw loteError;

    // 4. Create Ingreso Log
    const { error: ingresoError } = await supabase
      .from('ingresos')
      .insert({
        // @ts-ignore
        lote_id: lote.id,
        tipo: 'crisis',
        cantidad: cantidad,
        registrado_por: userId,
        triaje_pendiente: true,
        descripcion_bulto: tipoMedida === 'bultos' ? `Ingreso por Bultos (${cantidad})` : `Ingreso por Peso (${cantidad}kg)`,
        peso_estimado: tipoMedida === 'peso' ? cantidad : undefined
      } as any);

    if (ingresoError) throw ingresoError;

    return lote;
  }
};
