import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oagyukpbihkjvarkomvr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZ3l1a3BiaWhranZhcmtvbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NDcxMTIsImV4cCI6MjA5MjEyMzExMn0.KonLocdtL2R94k8n2gZb_5E6KOEiFCG5xNEMV3oR9d8'

export const supabase = createClient(supabaseUrl, supabaseKey)