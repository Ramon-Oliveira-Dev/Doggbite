import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lxqnjwyjcvgkdzeioqjl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4cW5qd3lqY3Zna2R6ZWlvcWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NzIwNTIsImV4cCI6MjA5MTA0ODA1Mn0.caWqM0sDs_CtWFaItNgbHK8pOv1sBazFaVu4YtzWAQ4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
