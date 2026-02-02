
import { supabase } from '@/lib/supabase';
import type { TriajeItem, TriajeProcessPayload } from '../types/triaje.types';

export const triajeService = {
  /**
   * Fetch all pending triage items (bultos).
   */
  async getPendingItems(): Promise<TriajeItem[]> {
    const { data, error } = await supabase
      .from('v_triaje_pendiente')
      .select('*')
      .order('fecha_ingreso', { ascending: true });

    if (error) throw error;
    return (data as any) || [];
  },

  /**
   * Fetch specific pending triage item details.
   */
  async getById(id: number): Promise<TriajeItem | null> {
    const { data, error } = await supabase
      .from('v_triaje_pendiente')
      .select('*')
      .eq('ingreso_id', id)
      .single();
    
    if (error) throw error;
    return data as TriajeItem | null;
  },

  /**
   * Process a bulto:
   * 1. Add valid items to stock (new log + new lote).
   * 2. Add discards (log in descartes).
   * 3. Reduce quantity from original bulto lote OR mark as exhausted.
   */
  async processTriaje(payload: TriajeProcessPayload, userId: string) {
    const { lote_id, items, descartes } = payload;
    
    // 1. Validate Original Lote exists
    const { data: originalLote, error: loteErr } = await supabase
      .from('lotes')
      .select('*')
      .eq('id', lote_id)
      .single();
    
    if (loteErr || !originalLote) throw new Error("Lote original no encontrado");

    // 2. Process Valid Items
    for (const item of items) {
      // Create new Lote for classified item
      const { data: newLote, error: newLoteErr } = await (supabase
        .from('lotes') as any)
        .insert({
          producto_id: item.producto_id,
          donante_id: (originalLote as any).donante_id, // Inherit donor
          cantidad_inicial: item.cantidad,
          cantidad_actual: item.cantidad,
          estado: 'disponible',
          fecha_caducidad: item.fecha_vencimiento || null,
          fecha_ingreso: new Date().toISOString(),
          notas: `Clasificado desde bulto ${(originalLote as any).codigo} - ${item.notas || ''}`,
          created_by: userId
        })
        .select()
        .single();

      if (newLoteErr) throw newLoteErr;

      // Log Ingreso for traceability
      await (supabase.from('ingresos') as any).insert({
        lote_id: (newLote as any).id,
        tipo: 'normal',
        cantidad: item.cantidad,
        registrado_por: userId,
        triaje_pendiente: false,
        descripcion_bulto: `Derivado de Triaje ${(originalLote as any).codigo}` 
      });
    }

    // 3. Process Discards
    for (const descarte of descartes) {
      await (supabase.from('descartes') as any).insert({
        producto_id: descarte.producto_id || null,
        descripcion: descarte.descripcion,
        cantidad: descarte.cantidad,
        motivo_descarte: descarte.motivo_descarte,
        registrado_por: userId,
        fecha_descarte: new Date().toISOString()
      });
    }

    // 4. Update Original Lote
    const newQuantity = Math.max(0, (originalLote as any).cantidad_actual - 1); // Reducing by 1 unit/bulto
    const newStatus = newQuantity === 0 ? 'agotado' : 'triaje_pendiente';

    await (supabase
      .from('lotes') as any)
      .update({ 
        cantidad_actual: newQuantity,
        estado: newStatus
      })
      .eq('id', lote_id);
      
    if (newStatus === 'agotado') {
         await (supabase
        .from('ingresos') as any)
        .update({ triaje_pendiente: false })
        .eq('lote_id', lote_id);
    }
    
    return true;
  }
};

