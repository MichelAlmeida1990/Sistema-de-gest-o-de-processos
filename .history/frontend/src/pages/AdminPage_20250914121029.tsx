import React from 'react'
import { Typography } from 'antd'

const { Title } = Typography

export const AdminPage: React.FC = () => {
  return (
    <div className="admin-page">
      <Title level={2}>Administração</Title>
      <p>Página de administração será implementada aqui.</p>
    </div>
  )
}

