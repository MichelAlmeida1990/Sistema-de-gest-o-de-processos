import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { LoadingSpinner } from './components/LoadingSpinner'

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
import { AdminPage } from './pages/AdminPage'
import { NotFoundPage } from './pages/NotFoundPage'

// Componentes de Layout
import { AppLayout } from './components/layout/AppLayout'

function AppContent() {
  const { user, isLoading } = useAuth()

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
        <Route path="/deliveries" element={<DeliveriesPage />} />
        <Route path="/financial" element={<FinancialPage />} />
        <Route path="/admin" element={<AdminPage />} />
        
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