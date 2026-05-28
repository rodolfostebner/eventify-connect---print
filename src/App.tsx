import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./hooks/useAuth"
import EventPage from "./pages/EventPage"
import AdminDashboard from "./pages/AdminDashboard"
import ModerationPanel from "./pages/ModerationPanel"
import TVView from "./pages/TVView"
import OperatorPanel from "./pages/OperatorPanel"
import ExhibitorPanelPage from "./pages/ExhibitorPanelPage"
import ExhibitorPortalPage from "./pages/ExhibitorPortalPage"
import PartnerPanelPage from "./pages/PartnerPanelPage"
import EventAdminPortalPage from "./pages/EventAdminPortalPage"
import AvaliadorPageComponent from "./pages/AvaliadorPage"
import LoginPage from "./pages/LoginPage"
import { Toaster } from "sonner"
import { NotificationsListener } from "./components/NotificationsListener"

function App() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Carregando Sistema...</p>
      </div>
    </div>
  )

  const isAdmin      = user?.role === 'admin';
  const isEventAdmin = user?.role === 'event_admin';
  const isAvaliador  = user?.role === 'avaliador';
  const isExpositor  = user?.role === 'expositor';

  return (
    <BrowserRouter>
      <Toaster position="top-center" expand={true} richColors />
      <NotificationsListener />
      <Routes>
        {/* Login unificado */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas públicas */}
        <Route path="/event/:slug" element={<EventPage user={user} />} />
        <Route path="/tv/:slug" element={<TVView />} />

        {/* Portal Expositor */}
        <Route path="/expositor" element={isExpositor ? <ExhibitorPortalPage /> : <Navigate to="/login" replace />} />

        {/* Portal EventAdmin — event_admin (próprio evento) e admin geral (por slug) */}
        <Route path="/eventadmin" element={(isEventAdmin || isAdmin) ? <EventAdminPortalPage /> : <Navigate to="/login" replace />} />
        <Route path="/eventadmin/:slug" element={(isEventAdmin || isAdmin) ? <EventAdminPortalPage /> : <Navigate to="/login" replace />} />

        {/* Portal Avaliador */}
        <Route path="/avaliador" element={isAvaliador ? <AvaliadorPageComponent /> : <Navigate to="/login" replace />} />
        {/* Visão de avaliação para admin/event_admin (leitura) */}
        <Route path="/avaliacao/:slug" element={(isAdmin || isEventAdmin) ? <AvaliadorPageComponent /> : <Navigate to="/login" replace />} />

        {/* Rotas Admin Geral */}
        <Route path="/" element={<AdminDashboard user={user} />} />
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="/moderation/:slug" element={(isAdmin || isEventAdmin) ? <ModerationPanel user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/operator/:slug" element={isAdmin ? <OperatorPanel user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/expositores/:slug" element={(isAdmin || isEventAdmin) ? <ExhibitorPanelPage /> : <Navigate to="/login" replace />} />
        <Route path="/parceiros/:slug" element={(isAdmin || isEventAdmin) ? <PartnerPanelPage /> : <Navigate to="/login" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
