import React, { useState, useEffect } from 'react'
import { Card, Button, Typography, Space, Tag } from 'antd'
import { BugOutlined, ClearOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import { debugLogger } from '../utils/debug'

const { Title, Text } = Typography

interface DebugPanelProps {
  isVisible?: boolean
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible = false }) => {
  const [logs, setLogs] = useState(debugLogger.getLogs())
  const [showPanel, setShowPanel] = useState(isVisible)

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs([...debugLogger.getLogs()])
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const clearLogs = () => {
    debugLogger.clearLogs()
    setLogs([])
  }

  const togglePanel = () => {
    setShowPanel(!showPanel)
  }

  if (!showPanel) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999
      }}>
        <Button
          type="primary"
          shape="circle"
          icon={<BugOutlined />}
          onClick={togglePanel}
          style={{
            background: '#ff4d4f',
            borderColor: '#ff4d4f',
            boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)'
          }}
        />
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '500px',
      zIndex: 9999,
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden'
    }}>
      <Card
        title={
          <Space>
            <BugOutlined />
            <span>Debug Panel</span>
            <Tag color="red">{logs.length} logs</Tag>
          </Space>
        }
        size="small"
        extra={
          <Space>
            <Button
              size="small"
              icon={<ClearOutlined />}
              onClick={clearLogs}
            >
              Clear
            </Button>
            <Button
              size="small"
              icon={<EyeInvisibleOutlined />}
              onClick={togglePanel}
            />
          </Space>
        }
        style={{ margin: 0, height: '100%' }}
        bodyStyle={{ 
          padding: '8px', 
          height: '400px', 
          overflow: 'auto',
          fontSize: '11px'
        }}
      >
        <div style={{ fontFamily: 'monospace' }}>
          {logs.length === 0 ? (
            <Text type="secondary">Nenhum log ainda...</Text>
          ) : (
            logs.slice(-20).map((log, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                <Tag color="blue" size="small">
                  {log.component}
                </Tag>
                <Tag color="green" size="small">
                  {log.action}
                </Tag>
                <Text style={{ fontSize: '10px', color: '#666' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </Text>
                {log.data && (
                  <div style={{ marginTop: '2px', color: '#333' }}>
                    {JSON.stringify(log.data, null, 2)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}

export default DebugPanel






