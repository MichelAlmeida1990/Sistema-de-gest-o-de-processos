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
    borderRadius: 8,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Layout: {
      headerBg: '#031f5f',
      siderBg: '#f5f5f5',
    },
    Button: {
      colorPrimary: '#031f5f',
      colorPrimaryHover: '#00afee',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#e6f7ff',
      itemSelectedColor: '#031f5f',
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={ptBR} theme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)

