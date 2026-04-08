/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from './lib/firebase';
import { auth } from './lib/firebase';
import { Toaster } from 'sonner';
import EventPage from './pages/EventPage';
import AdminDashboard from './pages/AdminDashboard';
import TVView from './pages/TVView';
import OperatorPanel from './pages/OperatorPanel';
import ModerationPanel from './pages/ModerationPanel';
import { NotificationsListener } from './components/NotificationsListener';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <NotificationsListener />
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<AdminDashboard user={user} />} />
          <Route path="/evento/:slug" element={<EventPage user={user} />} />
          <Route path="/evento/:slug/tv" element={<TVView />} />
          <Route path="/evento/:slug/operator" element={<OperatorPanel user={user} />} />
          <Route path="/evento/:slug/moderation" element={<ModerationPanel user={user} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

