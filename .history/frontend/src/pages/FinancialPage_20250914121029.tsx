import React from 'react'
import { Typography } from 'antd'

const { Title } = Typography

export const FinancialPage: React.FC = () => {
  return (
    <div className="financial-page">
      <Title level={2}>Financeiro</Title>
      <p>Página de gestão financeira será implementada aqui.</p>
    </div>
  )
}

