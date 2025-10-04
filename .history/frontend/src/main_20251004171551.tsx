import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { QueryClient, QueryClientProvider } from 'react-query'
import ptBR from 'antd/locale/pt_BR'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

import App from './App'
import './index.css'

// Configurar locale do dayjs
dayjs.locale('pt-br')

// Configurar cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
})

// Tema customizado do Ant Design
const theme = {
  token: {
    colorPrimary: '#031f5f',
    colorInfo: '#00afee',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    borderRadius: 12,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    lineHeight: 1.6,
    colorText: '#1e293b',
    colorTextSecondary: '#64748b',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#f8fafc',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    boxShadowSecondary: '0 8px 24px rgba(0, 0, 0, 0.1)',
    motion: true,
    motionDurationSlow: '0.3s',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  components: {
    Layout: {
      headerBg: 'transparent',
      siderBg: 'transparent',
      bodyBg: 'transparent',
    },
    Button: {
      colorPrimary: '#031f5f',
      colorPrimaryHover: '#00afee',
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 600,
      boxShadow: '0 4px 12px rgba(3, 31, 95, 0.15)',
    },
    Card: {
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      colorBgContainer: '#ffffff',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(0, 175, 238, 0.1)',
      itemSelectedColor: '#00afee',
      itemHoverBg: 'rgba(0, 175, 238, 0.05)',
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 12,
      fontSize: 14,
    },
    Select: {
      borderRadius: 12,
      fontSize: 14,
    },
    Table: {
      borderRadius: 12,
      fontSize: 14,
    },
    Tag: {
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 500,
    },
    Badge: {
      fontSize: 12,
      fontWeight: 600,
    },
    Avatar: {
      fontSize: 14,
    },
    Typography: {
      titleMarginBottom: '0.5em',
      titleMarginTop: '1.2em',
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={ptBR} theme={theme}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)

