import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if keys are available
const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL';

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const checkSupabaseConfig = () => {
    if (!isConfigured) {
        console.warn("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.");
        return false;
    }
    return true;
};
