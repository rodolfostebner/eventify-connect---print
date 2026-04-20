import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./hooks/useAuth"
import EventPage from "./pages/EventPage"
import AdminDashboard from "./pages/AdminDashboard"
import ModerationPanel from "./pages/ModerationPanel"
import TVView from "./pages/TVView"
import OperatorPanel from "./pages/OperatorPanel"
import { Toaster } from "sonner"

function App() {
  const { user, login, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Carregando Sistema...</p>
      </div>
    </div>
  )

  return (
    <BrowserRouter>
      <Toaster position="top-center" expand={true} richColors />
      <Routes>
        {/* Public Routes */}
        <Route path="/event/:slug" element={<EventPage user={user} />} />
        <Route path="/tv/:slug" element={<TVView />} />
        
        {/* Protected Admin Routes */}
        <Route path="/" element={user ? <AdminDashboard user={user} /> : <LoginScreen login={login} />} />
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="/moderation/:slug" element={user ? <ModerationPanel user={user} /> : <Navigate to="/" replace />} />
        <Route path="/operator/:slug" element={user ? <OperatorPanel user={user} /> : <Navigate to="/" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function LoginScreen({ login }: { login: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-6">
      <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-neutral-100 text-center max-w-sm w-full">
        <div className="w-20 h-20 bg-neutral-900 rounded-[32px] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl text-4xl">🐨</div>
        <h1 className="text-3xl font-black tracking-tighter mb-4">Eventify</h1>
        <p className="text-neutral-400 text-sm font-medium mb-10 leading-relaxed">
          Área administrativa. Entre com sua conta autorizada para gerenciar eventos.
        </p>
        <button 
          onClick={login}
          className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-200"
        >
          Entrar com Google
        </button>
      </div>
    </div>
  )
}

export default App
