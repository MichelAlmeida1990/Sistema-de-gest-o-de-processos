// ===========================================
// DASHBOARD MOBILE NATIVO - SEM ANT DESIGN
// ===========================================

import React from 'react'
import { useNavigate } from 'react-router-dom'

export const NativeMobileDashboardPage: React.FC = () => {
  const navigate = useNavigate()

  const stats = [
    {
      title: 'Processos Ativos',
      value: '12',
      icon: '📋',
      color: '#1890ff',
      onClick: () => navigate('/processes')
    },
    {
      title: 'Tarefas Concluídas',
      value: '8',
      icon: '✅',
      color: '#52c41a',
      onClick: () => navigate('/tasks')
    },
    {
      title: 'Tempo Médio',
      value: '2.5h',
      icon: '⏰',
      color: '#faad14',
      onClick: () => navigate('/timeline')
    },
    {
      title: 'Receita Total',
      value: 'R$ 45.2k',
      icon: '💰',
      color: '#722ed1',
      onClick: () => navigate('/financial')
    }
  ]

  const recentActivities = [
    {
      title: 'Processo Criado',
      description: 'Novo processo trabalhista cadastrado no sistema',
      status: 'Processo',
      user: 'Ana Santos',
      date: '15/01/2024 08:00',
      icon: '📋'
    },
    {
      title: 'Tarefa de Cálculo Criada',
      description: 'Cálculo de rescisão trabalhista - análise de documentos',
      status: 'Tarefa',
      user: 'Carlos Lima',
      date: '15/01/2024 10:30',
      icon: '🧮'
    },
    {
      title: 'Comentário Adicionado',
      description: 'Novo comentário no processo 1001234-56.2024.8.26.0001',
      status: 'Comentário',
      user: 'Maria Silva',
      date: '15/01/2024 14:15',
      icon: '💬'
    }
  ]

  return (
    <div className="native-mobile-content">
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 className="native-mobile-title">Dashboard</h1>
        <p className="native-mobile-subtitle">Visão geral do sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="native-mobile-stats">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="native-mobile-stat"
            onClick={stat.onClick}
          >
            <span className="native-mobile-stat-icon">{stat.icon}</span>
            <div className="native-mobile-stat-label">{stat.title}</div>
            <div 
              className="native-mobile-stat-value"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '24px' }}>
        <h2 className="native-mobile-section-title">Ações Rápidas</h2>
        <button
          className="native-mobile-button native-mobile-button-primary"
          onClick={() => navigate('/processes')}
        >
          <span>➕</span>
          Novo Processo
        </button>
        
        <button
          className="native-mobile-button native-mobile-button-secondary"
          onClick={() => navigate('/reports')}
        >
          <span>📊</span>
          Ver Relatórios
        </button>
      </div>

      {/* Recent Activities */}
      <div>
        <h2 className="native-mobile-section-title">Atividades Recentes</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentActivities.map((activity, index) => (
            <div
              key={index}
              className="native-mobile-card"
              onClick={() => navigate('/processes')}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {/* Icon */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '18px' }}>{activity.icon}</span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 className="native-mobile-card-title">{activity.title}</h3>
                  <p className="native-mobile-card-description">{activity.description}</p>
                  
                  {/* Meta info */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    flexWrap: 'wrap',
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    <span style={{
                      background: '#e6f7ff',
                      color: '#1890ff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {activity.status}
                    </span>
                    
                    <span>👤 {activity.user}</span>
                    <span>🕐 {activity.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
