import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

let supabaseClient

function readRuntimeConfig() {
  const config = window.TRHAIRGUIDE_RUNTIME_CONFIG || {}
  const url = String(config.SUPABASE_URL || '').trim()
  const key = String(config.SUPABASE_PUBLISHABLE_KEY || '').trim()

  if (!url || !key || url.includes('请填写') || key.includes('请填写')) {
    throw new Error('Supabase 配置缺失，请先生成 assets/runtime-config.js。')
  }

  return { url, key }
}

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  const { url, key } = readRuntimeConfig()
  supabaseClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
  return supabaseClient
}
