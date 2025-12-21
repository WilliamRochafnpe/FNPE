
import { User, DB } from '../../types';

export interface AuthProfileData {
  email: string;
  nomeCompleto: string;
  cpf: string;
  telefone?: string;
  cidade: string;
  estado: string;
}

export interface AuthService {
  requestOtp(email: string): Promise<string | void>; // Retorna o código no modo local para debug
  verifyOtp(email: string, code: string): Promise<{ success: boolean; error?: string }>;
  findUserByEmail(db: DB, email: string): Promise<User | null>;
  findUserByCpf(db: DB, cpf: string): Promise<User | null>;
  createUserFromProfile(db: DB, setDb: (fn: (prev: DB) => DB) => void, profile: AuthProfileData): Promise<User>;
}
