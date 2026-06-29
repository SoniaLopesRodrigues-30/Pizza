import { createClient } from '@supabase/supabase-js'

// 1. URL CORRIGIDA: Terminando apenas em .co
const supabaseUrl = 'https://lbxmzzvuaigrpsmtjwzt.supabase.co'

// 2. CHAVE DA API: Vá no seu painel do Supabase em Project Settings > API 
// e copie o código que está no campo "anon / public" (ela costuma começar com "eyJ...")
const supabaseAnonKey = 'sb_publishable_SNB3pNB_tyPVxLGCkvndow_LSsoPhT4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
