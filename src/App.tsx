import { BrowserRouter, Routes, Route } from "react-router-dom"
import EventPage from "./pages/EventPage"
import { useAuth } from "./hooks/useAuth"
import UploadTest from "./components/UploadTest"

function App() {
  const { user, login, logout, loading } = useAuth()

  if (loading) return <p>Carregando...</p>

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={login}>Entrar com Google</button>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/event/:eventId" element={<EventPage user={user} />} />
        <Route path="/upload-test" element={<UploadTest />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

