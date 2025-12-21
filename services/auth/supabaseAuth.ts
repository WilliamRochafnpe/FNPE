
import { supabase } from '../../lib/supabase';
import { AuthService, AuthProfileData } from './types';
import { User, DB } from '../../types';

export const supabaseAuth: AuthService = {
  async requestOtp(email: string): Promise<void> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  },

  async verifyOtp(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async findUserByEmail(_db: DB, email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !data) return null;

    // Mapping snake_case from DB to camelCase for the app
    return {
      id: data.id,
      email: data.email,
      nomeCompleto: data.nome_completo,
      nivel: data.nivel,
      estado: data.estado,
      cidade: data.cidade,
      cpf: data.cpf,
      telefone: data.telefone,
      idNorteStatus: data.id_norte_status,
      idNorteNumero: data.id_norte_numero,
      idNortePdfLink: data.id_norte_pdf_link,
      idNorteAdesao: data.id_norte_adesao,
      idNorteValidade: data.id_norte_validade,
      createdAt: data.created_at
    };
  },

  async findUserByCpf(_db: DB, cpf: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('cpf', cpf)
      .single();

    if (error || !data) return null;
    return data as any; // Map if needed
  },

  async createUserFromProfile(_db: DB, _setDb: any, profile: AuthProfileData): Promise<User> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error("Usuário não autenticado no Supabase Auth");

    const newProfile = {
      id: authUser.id,
      email: profile.email.toLowerCase(),
      nome_completo: profile.nomeCompleto,
      cpf: profile.cpf,
      telefone: profile.telefone,
      cidade: profile.cidade,
      estado: profile.estado,
      nivel: 'PESCADOR',
      id_norte_status: 'NAO_SOLICITADO'
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(newProfile)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      email: data.email,
      nomeCompleto: data.nome_completo,
      nivel: data.nivel,
      estado: data.estado,
      cidade: data.cidade,
      idNorteStatus: data.id_norte_status
    } as any;
  }
};
