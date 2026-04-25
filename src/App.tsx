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
        <Route path="/" element={<AdminDashboard user={user} />} />
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="/moderation/:slug" element={user ? <ModerationPanel user={user} /> : <Navigate to="/" replace />} />
        <Route path="/operator/:slug" element={user ? <OperatorPanel user={user} /> : <Navigate to="/" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
