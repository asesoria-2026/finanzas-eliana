import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zqfciflgksxxqbfvxkad.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxZmNpZmxna3N4eHFiZnZ4a2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTk5NjgsImV4cCI6MjA5OTUzNTk2OH0.lJDps1bqv4nvVPhGuF2rzXNlpdfJeyKjXZQdR_Bqsao'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function cargarDatos(userId) {
  const { data, error } = await supabase
    .from('finanzas_data')
    .select('data')
    .eq('user_id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data?.data || null
}

export async function guardarDatos(userId, datos) {
  // Intentar update primero; si no existe la fila, hacer insert
  const { error: updateError } = await supabase
    .from('finanzas_data')
    .update({ data: datos, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (updateError) {
    // Si update falla, intentar insert
    const { error: insertError } = await supabase
      .from('finanzas_data')
      .insert({ user_id: userId, data: datos, updated_at: new Date().toISOString() })
    if (insertError) throw insertError
  }
}
