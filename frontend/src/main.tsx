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
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#208152',
            colorBgBase: '#f4f8f5',
            colorTextBase: '#111c16',
            colorBorder: 'rgba(30,91,61,0.16)',
            borderRadius: 8,
            fontSize: 14,
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
          },
          components: {
            Input: { colorBgContainer: 'rgba(255,255,255,0.9)' },
            Select: { colorBgContainer: 'rgba(255,255,255,0.9)' },
            Descriptions: { colorBgContainer: 'rgba(252,254,252,0.9)', colorFillAlter: 'rgba(32,129,82,0.05)' },
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
