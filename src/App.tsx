import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"
import { TeamProvider } from "@/contexts/TeamContext"
import { ToastProvider } from "@/contexts/ToastContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Layout } from "@/components/Layout"
import Dashboard from "@/pages/Dashboard"
import Candidates from "@/pages/Candidates"
import Templates from "@/pages/Templates"
import Settings from "@/pages/Settings"
import Teams from "@/pages/Teams"
import TeamOnboarding from "@/pages/TeamOnboarding"
import Invitations from "@/pages/Invitations"
import Admin from "@/pages/Admin"
import Login from "@/pages/Login"
import Signup from "@/pages/Signup"
import ForgotPassword from "@/pages/ForgotPassword"
import ResetPassword from "@/pages/ResetPassword"
import { useStore } from "@/store/useStore"

function AppContent() {
  const initialize = useStore((state) => state.initialize)

  useEffect(() => {
    // Temporarily disabled until team onboarding is implemented
    // initialize()
  }, [initialize])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/onboarding" element={<ProtectedRoute><TeamOnboarding /></ProtectedRoute>} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="templates" element={<Templates />} />
        <Route path="teams" element={<Teams />} />
        <Route path="invitations" element={<Invitations />} />
        <Route path="settings" element={<Settings />} />
        <Route path="admin" element={<Admin />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <TeamProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </TeamProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
