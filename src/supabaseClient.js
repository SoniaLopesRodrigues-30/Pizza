import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lbxmzzvuaigrpsmtjwzt.supabase.co'

const supabaseAnonKey = 'sb_publishable_SNB3pNB_tyPVxLGCkvndow_LSsoPhT4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


