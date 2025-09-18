import React from 'react'
import { Spin } from 'antd'

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large'
  tip?: string
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  tip = 'Carregando...',
  className = '',
}) => {
  return (
    <div className={`loading-container ${className}`}>
      <Spin size={size} tip={tip} />
      
      <style jsx>{`
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f5f5f5;
        }
        
        .ant-spin-text {
          color: var(--color-primary);
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}

