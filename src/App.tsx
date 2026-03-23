import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AttendeeList from './pages/AttendeeList';
import CheckIn from './pages/CheckIn';
import EmailCampaign from './pages/EmailCampaign';
import Settings from './pages/Settings';
import TicketDesign from './pages/TicketDesign';
import PublicRegistration from './pages/PublicRegistration';
import PublicCheckIn from './pages/PublicCheckIn';
import KioskMode from './pages/KioskMode';
import Sessions from './pages/Sessions';
import SessionCheckIn from './pages/SessionCheckIn';
import EventList from './pages/EventList';
import AdminDashboard from './pages/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const userDoc = await getDoc(doc(db, 'users', u.uid));
          setHasProfile(userDoc.exists());
        } catch (error) {
          console.error("Error checking user profile:", error);
          setHasProfile(false);
        }
      } else {
        setHasProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register/:eventId" element={<PublicRegistration />} />
          <Route path="/register" element={<PublicRegistration />} />
          <Route path="/checkin/:eventId" element={<PublicCheckIn />} />
          <Route path="/kiosk/:eventId" element={<KioskMode />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              !user ? (
                <Navigate to="/landing" replace />
              ) : hasProfile === false ? (
                <Navigate to="/auth" replace />
              ) : (
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<EventList />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/events/:eventId" element={<Dashboard />} />
                    <Route path="/events/:eventId/attendees" element={<AttendeeList />} />
                    <Route path="/events/:eventId/checkin" element={<CheckIn />} />
                    <Route path="/events/:eventId/email" element={<EmailCampaign />} />
                    <Route path="/events/:eventId/design" element={<TicketDesign />} />
                    <Route path="/events/:eventId/sessions" element={<Sessions />} />
                    <Route path="/events/:eventId/sessions/:sessionId/checkin" element={<SessionCheckIn />} />
                    <Route path="/events/:eventId/settings" element={<Settings />} />
                    
                    {/* Fallback to default event */}
                    <Route path="/attendees" element={<AttendeeList />} />
                    <Route path="/checkin" element={<CheckIn />} />
                    <Route path="/email" element={<EmailCampaign />} />
                    <Route path="/design" element={<TicketDesign />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                </Routes>
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
