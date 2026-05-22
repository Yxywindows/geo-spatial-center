import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import './styles.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#06b6d4',
            colorBgBase: '#04091a',
            colorTextBase: '#f1f5f9',
            colorBorder: 'rgba(255,255,255,0.12)',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
          },
          components: {
            Input: { colorBgContainer: 'rgba(255,255,255,0.05)' },
            Select: { colorBgContainer: 'rgba(255,255,255,0.05)' },
            Descriptions: { colorBgContainer: 'rgba(255,255,255,0.03)', colorFillAlter: 'rgba(255,255,255,0.02)' },
            Tag: { borderRadiusSM: 4 },
            Pagination: { colorBgContainer: 'transparent' },
          },
        }}
      >
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>
)
