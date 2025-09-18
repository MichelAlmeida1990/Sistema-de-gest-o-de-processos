import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'

import { useAuthStore } from './store/authStore'
import { AuthProvider } from './components/AuthProvider'
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
import { AdminPage } from './pages/AdminPage'
import { NotFoundPage } from './pages/NotFoundPage'

// Componentes de Layout
import { AppLayout } from './components/layout/AppLayout'

const { Content } = Layout

function App() {
  const { isAuthenticated } = useAuthStore()

  // Se não estiver autenticado, mostrar página de login
  if (!isAuthenticated) {
    return (
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    )
  }

  // Se estiver autenticado, mostrar aplicação principal
  return (
    <AuthProvider>
      <AppLayout>
        <Routes>
          {/* Rotas principais */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/processes" element={<ProcessesPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="/deliveries" element={<DeliveriesPage />} />
          <Route path="/financial" element={<FinancialPage />} />
          <Route path="/admin" element={<AdminPage />} />
          
          {/* Rota de fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppLayout>
    </AuthProvider>
  )
}

export default App

