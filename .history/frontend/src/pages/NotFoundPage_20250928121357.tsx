import React from 'react'
import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="not-found-page">
      <Result
        status="404"
        title="404"
        subTitle="Desculpe, a página que você visitou não existe."
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        }
      />
    </div>
  )
}












