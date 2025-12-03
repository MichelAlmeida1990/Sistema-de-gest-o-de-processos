import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { LoadingSpinner } from './components/LoadingSpinner'
import { useMobile } from './hooks/useMobile'

// Páginas
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProcessesPage } from './pages/ProcessesPage'
import { TasksPage } from './pages/TasksPage'
import { DeliveriesPage } from './pages/DeliveriesPage'
import { FinancialPage } from './pages/FinancialPage'
import { KanbanPage } from './pages/KanbanPage'
import { TimelinePage } from './pages/TimelinePage'
import { FileManagerPage } from './pages/FileManagerPage'
import { ReportsPage } from './pages/ReportsPage'
import { PrecatoriosPage } from './pages/PrecatoriosPage'
import { AdminPage } from './pages/AdminPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { SearchPage } from './pages/SearchPage'
import { FunnelPage } from './pages/FunnelPage'
import { RDStationPage } from './pages/RDStationPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { DeadlineCalculatorPage } from './pages/DeadlineCalculatorPage'
import { LegalDiagnosisPage } from './pages/LegalDiagnosisPage'
import { JurisprudencePage } from './pages/JurisprudencePage'

// Componentes de Layout
import { AppLayout } from './components/layout/AppLayout'

function AppContent() {
  const { user, isLoading } = useAuth()
  const { mobile, loading: mobileLoading } = useMobile()

  // Loading para detecção de mobile
  if (mobileLoading) {
    return <LoadingSpinner />
  }

  // Em mobile, mostrar login se não autenticado, senão mostrar app
  if (mobile) {
    // Se não estiver autenticado, mostrar página de login
    if (!user) {
      return (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )
    }
    
    // Se estiver autenticado, mostrar aplicação
    return (
      <AppLayout>
        <Routes>
          {/* Rotas principais */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/processes" element={<ProcessesPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/files" element={<FileManagerPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/deliveries" element={<DeliveriesPage />} />
          <Route path="/financial" element={<FinancialPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/funnel" element={<FunnelPage />} />
          <Route path="/rdstation" element={<RDStationPage />} />
          <Route path="/admin" element={<AdminPage />} />
          
          {/* Rota de fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppLayout>
    )
  }

  // Em desktop, manter autenticação normal
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Se não estiver autenticado, mostrar página de login
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Se estiver autenticado, mostrar aplicação principal
  return (
    <AppLayout>
      <Routes>
        {/* Rotas principais */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/processes" element={<ProcessesPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/files" element={<FileManagerPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/precatorios" element={<PrecatoriosPage />} />
        <Route path="/deliveries" element={<DeliveriesPage />} />
        <Route path="/financial" element={<FinancialPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/funnel" element={<FunnelPage />} />
        <Route path="/rdstation" element={<RDStationPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/deadline-calculator" element={<DeadlineCalculatorPage />} />
        <Route path="/legal-diagnosis" element={<LegalDiagnosisPage />} />
        <Route path="/jurisprudence" element={<JurisprudencePage />} />
        
        {/* Rota de fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App