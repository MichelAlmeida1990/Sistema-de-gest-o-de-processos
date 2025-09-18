import React from 'react'
import { Spin } from 'antd'

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large'
  tip?: string
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  tip,
  className = '',
}) => {
  return (
    <div 
      className={`loading-container ${className}`}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Spin size={size} tip={tip} />
    </div>
  )
}

