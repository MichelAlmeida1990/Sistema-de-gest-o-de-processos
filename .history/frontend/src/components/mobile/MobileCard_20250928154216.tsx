// ===========================================
// CARD ESPECÍFICO PARA MOBILE
// ===========================================

import React from 'react'
import { Card, Typography, Space, Tag, Avatar, Button } from 'antd'
import { UserOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

interface MobileCardProps {
  title: string
  description?: string
  status?: string
  user?: string
  date?: string
  icon?: string
  onClick?: () => void
  children?: React.ReactNode
}

export const MobileCard: React.FC<MobileCardProps> = ({
  title,
  description,
  status,
  user,
  date,
  icon,
  onClick,
  children
}) => {
  return (
    <Card
      onClick={onClick}
      style={{
        marginBottom: '12px',
        borderRadius: '12px',
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: onClick ? 'pointer' : 'default',
        background: '#ffffff'
      }}
      bodyStyle={{
        padding: '16px'
      }}
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
          {icon ? (
            <span style={{ fontSize: '18px' }}>{icon}</span>
          ) : (
            <FileTextOutlined style={{ color: '#ffffff', fontSize: '18px' }} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Title level={5} style={{
            margin: 0,
            marginBottom: '4px',
            fontSize: '16px',
            lineHeight: '1.4',
            wordWrap: 'break-word',
            wordBreak: 'break-word'
          }}>
            {title}
          </Title>

          {description && (
            <Text style={{
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.4',
              wordWrap: 'break-word',
              wordBreak: 'break-word',
              display: 'block',
              marginBottom: '8px'
            }}>
              {description}
            </Text>
          )}

          {/* Status and Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {status && (
              <Tag color="blue" style={{ fontSize: '12px', margin: 0 }}>
                {status}
              </Tag>
            )}
            
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Avatar size={16} icon={<UserOutlined />} />
                <Text style={{ fontSize: '12px', color: '#666' }}>
                  {user}
                </Text>
              </div>
            )}
            
            {date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ClockCircleOutlined style={{ fontSize: '12px', color: '#666' }} />
                <Text style={{ fontSize: '12px', color: '#666' }}>
                  {date}
                </Text>
              </div>
            )}
          </div>

          {children}
        </div>
      </div>
    </Card>
  )
}
