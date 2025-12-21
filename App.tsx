
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { loadDB, saveDB, ADMIN_EMAIL, ensureAdminUser } from './db';
import { DB, User } from './types';
import { supabase } from './lib/supabase';
import { auth as authProvider, IS_SUPABASE } from './services/auth';

import Login from './pages/Login';
import AuthEmail from './pages/AuthEmail';
import AuthCode from './pages/AuthCode';
import AuthCompleteProfile from './pages/AuthCompleteProfile';
import AuthRecover from './pages/AuthRecover';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Rankings from './pages/Rankings';
import RankingEstado from './pages/RankingEstado';
import Athletes from './pages/Athletes';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import AdminCommunication from './pages/AdminCommunication';
import AdminCertificationRequests from './pages/AdminCertificationRequests';
import IdNortePage from './pages/IdNorte';
import ConsultarIdNorte from './pages/ConsultarIdNorte';
import Profile from './pages/Profile';
import CertificationRequestForm from './pages/CertificationRequestForm';
import Layout from './components/Layout';

interface AppContextType {
  db: DB;
  setDb: React.Dispatch<React.SetStateAction<DB>>;
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const App: React.FC = () => {
  const [db, setDb] = useState<DB>(() => loadDB());
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Efeito de inicialização e escuta do Supabase
  useEffect(() => {
    const initializeAuth = async () => {
      if (IS_SUPABASE) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const profile = await authProvider.findUserByEmail(db, session.user.email);
          setUser(profile);
        }
      } else {
        const saved = localStorage.getItem('fnpe_session');
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch (e) {
            console.error(e);
          }
        }
      }
      setInitializing(false);
    };

    initializeAuth();

    if (IS_SUPABASE) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email) {
          const profile = await authProvider.findUserByEmail(db, session.user.email);
          setUser(profile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  // Persistência local do DB
  useEffect(() => {
    const updatedDb = ensureAdminUser(db);
    saveDB(updatedDb);
  }, [db]);

  const handleSetUser = (u: User | null) => {
    if (u && u.email && u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      u.nivel = 'ADMIN';
    }
    setUser(u);
    if (!IS_SUPABASE) {
      if (u) localStorage.setItem('fnpe_session', JSON.stringify(u));
      else localStorage.removeItem('fnpe_session');
    }
  };

  const logout = async () => {
    if (IS_SUPABASE) {
      await supabase.auth.signOut();
    }
    handleSetUser(null);
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ db, setDb, user, setUser: handleSetUser, logout }}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/app" replace /> : <Login />} />
          <Route path="/login/email" element={<AuthEmail />} />
          <Route path="/login/codigo" element={<AuthCode />} />
          <Route path="/login/perfil" element={<AuthCompleteProfile />} />
          <Route path="/login/recuperar" element={<AuthRecover />} />
          <Route path="/app/*" element={user ? <AppRoutes /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
};

const AppRoutes = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/eventos" element={<Events />} />
        <Route path="/eventos/:id" element={<EventDetails />} />
        <Route path="/solicitar-certificacao" element={<CertificationRequestForm />} />
        <Route path="/ranking-estadual" element={<Rankings />} />
        <Route path="/ranking-estadual/:uf" element={<RankingEstado />} />
        <Route path="/atletas" element={<Athletes />} />
        <Route path="/admin" element={<AdminGate><Admin /></AdminGate>} />
        <Route path="/admin-dashboard" element={<AdminGate><AdminDashboard /></AdminGate>} />
        <Route path="/comunicacao" element={<AdminGate><AdminCommunication /></AdminGate>} />
        <Route path="/admin/certificacoes" element={<AdminGate><AdminCertificationRequests /></AdminGate>} />
        <Route path="/id-norte" element={<IdNortePage />} />
        <Route path="/consultar-id-norte" element={<ConsultarIdNorte />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </Layout>
  );
};

const AdminGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  if (user?.nivel !== 'ADMIN') return <Navigate to="/app" replace />;
  return <>{children}</>;
};

export default App;
