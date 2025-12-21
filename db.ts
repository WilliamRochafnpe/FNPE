
import { DB, User, Snapshot } from './types';

const DB_KEY = 'fnpe_db_v1';
const SNAPSHOT_KEY = 'fnpe_db_snapshots_v1';
export const ADMIN_EMAIL = 'williamrocha_25@icloud.com';

export const validateDB = (json: any): json is DB => {
  if (!json || typeof json !== 'object') return false;
  const requiredKeys = ['users', 'requests', 'events', 'results'];
  return requiredKeys.every(key => Array.isArray(json[key]));
};

export const ensureAdminUser = (db: DB): DB => {
  const adminExists = db.users.find(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
  
  const adminData: User = {
    id: adminExists?.id || 'admin-fixed-000',
    email: ADMIN_EMAIL,
    nomeCompleto: 'William Rocha',
    nivel: 'ADMIN',
    idNorteStatus: 'APROVADO',
    idNorteNumero: '00000',
    cpf: '52785785215',
    telefone: '96991245513',
    cidade: 'Macapá',
    estado: 'AP',
    createdAt: adminExists?.createdAt || new Date().toISOString()
  };

  if (adminExists) {
    return {
      ...db,
      users: db.users.map(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? adminData : u)
    };
  } else {
    return {
      ...db,
      users: [adminData, ...db.users]
    };
  }
};

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const SEED_DATA: DB = {
  settings: {
    appBranding: {
      appName: 'FNPE - Federação Norte de Pesca Esportiva',
    },
    appSupport: {
      supportWhatsApp: '5596999999999',
      supportEmail: 'suporte@fnpe.com.br'
    },
    rankingsCovers: {}
  },
  users: [
    {
      id: 'pescador-demo',
      email: 'pescador@demo.com',
      nomeCompleto: 'João Pescador',
      nivel: 'PESCADOR',
      idNorteStatus: 'NAO_SOLICITADO',
      estado: 'PA',
      cidade: 'Belém',
      createdAt: daysAgo(10)
    },
    {
      id: 'atleta-demo',
      email: 'atleta@demo.com',
      nomeCompleto: 'Maria Atleta',
      nivel: 'ATLETA',
      idNorteStatus: 'APROVADO',
      idNorteNumero: 'ID-00001',
      idNortePdfLink: 'https://example.com/id-norte-mock.pdf',
      idNorteAprovadoEm: daysAgo(45),
      estado: 'AM',
      cidade: 'Manaus',
      createdAt: daysAgo(100)
    }
  ],
  requests: [],
  certificationRequests: [],
  events: [
    {
      id: 'event-1',
      nomeEvento: '1º Torneio Tucunaré Master',
      descricao: 'Grande torneio de pesca esportiva no Rio Negro.',
      instituicaoOrganizadora: 'Associação de Pesca AM',
      responsaveis: 'Carlos Silva',
      cidade: 'Manaus',
      estado: 'AM',
      dataEvento: daysAgo(15).split('T')[0],
      temCaiaque: true,
      temEmbarcado: true,
      temArremesso: false,
      createdAt: daysAgo(20)
    }
  ],
  results: [
    {
      id: 'res-1',
      eventId: 'event-1',
      categoria: 'EMBARCADO',
      idNorteNumero: 'ID-00001',
      userId: 'atleta-demo',
      pontuacao: 1250.5,
      createdAt: daysAgo(14)
    }
  ]
};

export const loadDB = (): DB => {
  const data = localStorage.getItem(DB_KEY);
  let db: DB;
  
  if (!data) {
    db = SEED_DATA;
  } else {
    try {
      db = JSON.parse(data);
      if (!validateDB(db)) db = SEED_DATA;
    } catch {
      db = SEED_DATA;
    }
  }

  db = ensureAdminUser(db);
  if (!db.certificationRequests) db.certificationRequests = [];
  if (!db.settings) db.settings = SEED_DATA.settings;
  
  return db;
};

export const saveDB = (db: DB) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// Snapshot System
export const createSnapshot = (db: DB, label?: string) => {
  const snapshots = listSnapshots();
  const newSnapshot: Snapshot = {
    id: `snap-${Date.now()}`,
    createdAt: new Date().toISOString(),
    data: db,
    label
  };
  const updated = [newSnapshot, ...snapshots].slice(0, 10);
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(updated));
};

export const listSnapshots = (): Snapshot[] => {
  const data = localStorage.getItem(SNAPSHOT_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteSnapshot = (id: string) => {
  const snapshots = listSnapshots();
  const updated = snapshots.filter(s => s.id !== id);
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(updated));
};

export const resetToSeed = () => {
  const current = loadDB();
  createSnapshot(current, "Antes de resetar para Seed");
  saveDB(ensureAdminUser(SEED_DATA));
};

export const exportJSON = (data?: DB) => {
  const dbData = data || loadDB();
  const blob = new Blob([JSON.stringify(dbData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fnpe_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  a.click();
};

export const importJSONFile = (file: File): Promise<DB> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (validateDB(json)) {
          resolve(ensureAdminUser(json));
        } else {
          reject(new Error("Formato de backup inválido. Chaves obrigatórias ausentes."));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
};
