
import { localAuth } from './localAuth';
import { supabaseAuth } from './supabaseAuth';
import { AuthService } from './types';

// Verifica se as chaves do Supabase estão presentes no process.env
const hasSupabase = !!process.env.VITE_SUPABASE_URL && !!process.env.VITE_SUPABASE_ANON_KEY;
const AUTH_MODE = hasSupabase ? 'SUPABASE' : 'LOCAL';

export const auth: AuthService = AUTH_MODE === 'SUPABASE' ? supabaseAuth : localAuth;
export const IS_LOCAL = AUTH_MODE === 'LOCAL';
export const IS_SUPABASE = AUTH_MODE === 'SUPABASE';
