
import { supabase } from '@/lib/supabase';
import type { TriajeItem, TriajeProcessPayload } from '../types/triaje.types';
import { Database } from '@/types/database.types';

export const triajeService = {
  /**
   * Fetch all pending triage items (bultos).
   */
  async getPendingItems(): Promise<TriajeItem[]> {
    const { data, error } = await supabase
      .from('v_triaje_pendiente' as any)
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
    return data;
  },

  /**
   * Process a bulto:
   * 1. Add valid items to stock (new log + new lote).
   * 2. Add discards (log in descartes).
   * 3. Reduce quantity from original bulto lote OR mark as exhausted.
   * NOTE: This is complex transaction logic. We'll do it sequentially here for prototype, 
   * but in production should be a Postgres Function.
   */
  async processTriaje(payload: TriajeProcessPayload, userId: string) {
    const { lote_id, items, descartes } = payload;
    
    // 1. Validate Original Lote exists
    const { data: originalLote, error: loteErr } = await supabase
      .from('lotes' as any)
      .select('*')
      .eq('id', lote_id)
      .single();
    
    if (loteErr || !originalLote) throw new Error("Lote original no encontrado");

    // 2. Process Valid Items
    for (const item of items) {
      // Create new Lote for classified item
      const { data: newLote, error: newLoteErr } = await supabase
        .from('lotes' as any)
        .insert({
          producto_id: item.producto_id,
          donante_id: (originalLote as any).donante_id, // Inherit donor
          cantidad_inicial: item.cantidad,
          cantidad_actual: item.cantidad,
          estado: 'disponible',
          fecha_caducidad: item.fecha_vencimiento || null,
          fecha_ingreso: new Date().toISOString(), // Today's date as processed date? Or keep original? Let's use today.
          notas: `Clasificado desde bulto ${(originalLote as any).codigo} - ${item.notas || ''}`
        } as any)
        .select()
        .single();

      if (newLoteErr) throw newLoteErr;

      // Log Ingreso for traceability
      await supabase.from('ingresos' as any).insert({
        lote_id: (newLote as any).id,
        tipo: 'normal',
        cantidad: item.cantidad,
        registrado_por: userId,
        triaje_pendiente: false,
        descripcion_bulto: `Derivado de Triaje ${(originalLote as any).codigo}` 
      } as any);
    }

    // 3. Process Discards
    for (const descarte of descartes) {
      await supabase.from('descartes' as any).insert({
        producto_id: descarte.producto_id || null,
        descripcion: descarte.descripcion,
        cantidad: descarte.cantidad,
        motivo_descarte: descarte.motivo_descarte,
        registrado_por: userId,
        fecha_descarte: new Date().toISOString()
      } as any);
    }

    // 4. Update Original Lote
    // For "Bultos", we usually just decrement 1 bulto if we processed "1 bulto".
    // But here we might be processing PART of a bulto?
    // Simplified Logic: We assume the user is processing the WHOLE bulto (or checking it off).
    // If the measure is "bultos" and amount is 1, we mark it exhausted.
    // If amount > 1, we decrement 1?
    // Let's assume for this MVP that the user finishes the specific "Ingreso" line item.
    // Ideally we should ask "Cuanto bulto procesaste?".
    // Let's assume we consume ALL of the specific Ingreso quantity for now?
    // No, that's risky.
    // Let's just Reduce Quantity by 1 for now (if it acts as a queue).
    // Or simpler: Just mark the *Ingreso* record as processed? No, Ingreso is a log.
    // We update the LOTE.
    
    // We will decrement the current quantity of the crisis lote.
    // If it reaches 0, status -> agotado.
    
    // How much to decrement? 
    // If it was "10 kg", and we found "2 kg items" + "1 kg trash", did we process 3kg? 
    // Or did we process the whole 10kg sack?
    // It's ambiguous.
    // DECISION: For this prototype, we will ask the user "Have you finished this bulto?" or similar.
    // But since I didn't add that to UI, I will assume we Decrement 1 Unit (1 Bulto) or All Weight?
    // Let's just decrement 1 from 'cantidad_actual' if it's > 0.
    
    const newQuantity = Math.max(0, (originalLote as any).cantidad_actual - 1); // Reducing by 1 unit/bulto
    const newStatus = newQuantity === 0 ? 'agotado' : 'triaje_pendiente';

    await supabase
      .from('lotes' as any)
      .update({ 
        cantidad_actual: newQuantity,
        estado: newStatus
      } as any)
      .eq('id', lote_id);
      
    // Also update the 'ingresos' table? No, that's history.
    // Wait, if we use 'ingresos' table for the list (v_triaje_pendiente), 
    // v_triaje_pendiente joins lote. So if lote is agotado, does it disappear?
    // Let's check the view definition.
    // "SELECT ... FROM ingresos i JOIN lotes l ... WHERE i.triaje_pendiente = true"
    // So if we don't update i.triaje_pendiente, it stays there?
    // We SHOULD update i.triaje_pendiente = false if fully processed.
    
    if (newStatus === 'agotado') {
         await supabase
        .from('ingresos' as any) // Note: this might be multiple entries for same lote? No, 1:1 usually.
        .update({ triaje_pendiente: false } as any)
        .eq('lote_id', lote_id);
    }
    
    return true;
  }
};
