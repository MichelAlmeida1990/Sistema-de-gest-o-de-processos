import React from 'react'
import { Typography } from 'antd'

const { Title } = Typography

export const TasksPage: React.FC = () => {
  return (
    <div className="tasks-page">
      <Title level={2}>Tarefas de Cálculo</Title>
      <p>Página de gestão de tarefas será implementada aqui.</p>
    </div>
  )
}
