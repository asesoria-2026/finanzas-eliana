import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

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
  const { error } = await supabase
    .from('finanzas_data')
    .upsert({ user_id: userId, data: datos, updated_at: new Date().toISOString() })
  if (error) throw error
}
