
export type UserLevel = "ADMIN" | "PESCADOR" | "ATLETA";
export type IdNorteStatus = "NAO_SOLICITADO" | "PENDENTE" | "APROVADO" | "REPROVADO";
export type Category = "CAIAQUE" | "EMBARCADO" | "ARREMESSO" | "BARRANCO";

export interface ResponsiblePerson {
  id: string;
  nome: string;
  telefone: string;
  funcao?: string;
}

export interface UploadFile {
  id: string;
  name: string;
  mime: string;
  size: number;
  dataUrl?: string;
}

export type CertificationRequestStatus = "PENDENTE" | "APROVADO" | "REPROVADO";

export interface CertificationRequest {
  id: string;
  status: CertificationRequestStatus;
  requestedAt: string;
  requestedByUserId: string;
  requestedByEmail: string;

  // Evento
  logoDataUrl?: string;
  nomeEvento: string;
  dataInicio: string;
  dataFim: string;
  descricao?: string;
  categorias: Category[];
  cidade: string;
  estado: string;

  // Organização
  instituicaoNome: string;
  documento: string;
  documentoTipo: "CPF" | "CNPJ";
  responsaveis: ResponsiblePerson[];
  anexos: UploadFile[];

  // Decisão
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectReason?: string;
  eventId?: string;
}

export interface IdNorteRequest {
  id: string;
  userId: string;
  dataSolicitacao: string;
  status: "PENDENTE" | "APROVADO" | "REPROVADO";
  observacaoAdmin?: string;
}

export interface AppBranding {
  appName: string;
  appLogoDataUrl?: string;
}

export interface AppSupport {
  supportWhatsApp?: string;
  supportEmail?: string;
}

export interface AppSettings {
  appBranding: AppBranding;
  appSupport?: AppSupport;
  rankingsCovers?: Record<string, string>;
}

export interface User {
  id: string;
  email: string;
  nomeCompleto: string;
  cpf?: string;
  dataNascimento?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  fotoUrl?: string;
  nivel: UserLevel;
  idNorteStatus: IdNorteStatus;
  idNorteNumero?: string;
  idNortePdfLink?: string;
  idNorteAprovadoEm?: string;
  idNorteAdesao?: string;
  idNorteValidade?: string;
  createdAt?: string;
}

export interface EventCertified {
  id: string;
  nomeEvento: string;
  descricao: string;
  instituicaoOrganizadora: string;
  responsaveis: string; 
  cidade: string;
  estado: string;
  dataEvento: string; 
  temCaiaque: boolean;
  temEmbarcado: boolean;
  temArremesso: boolean;
  temBarranco?: boolean;
  logoDataUrl?: string;
  contactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventResult {
  id: string;
  eventId: string;
  categoria: Category;
  idNorteNumero: string;
  userId: string;
  pontuacao: number;
  colocacao?: number;
  createdAt?: string;
}

export interface Snapshot {
  id: string;
  createdAt: string;
  data: DB;
  label?: string;
}

export interface DB {
  users: User[];
  requests: IdNorteRequest[]; 
  certificationRequests: CertificationRequest[];
  events: EventCertified[];
  results: EventResult[];
  settings: AppSettings;
}
