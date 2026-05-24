import { GlobalOutlined } from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { label: '首页', path: '/' },
  { label: '数据检索', path: '/search' },
  { label: '特色数据', path: '/featured' },
  { label: '政策科普', path: '/policy' },
  { label: '关于本站', path: '/about' },
]

export default function SiteHeader() {
  const { pathname } = useLocation()

  return (
    <header className="gs-header">
      <div className="gs-header__inner">
        <a href="http://localhost:5173/" className="brand">
          <span className="brand__mark">JS</span>
          <span>
            <strong>江苏省科学数据中心</strong>
            <small>Jiangsu Scientific Data Center</small>
          </span>
        </a>

        <Link to="/" className="gs-logo">
          <GlobalOutlined className="gs-logo__icon" />
          <div className="gs-logo__text">
            <span className="gs-logo__title">地理空间智能与人地系统数据中心</span>
          </div>
        </Link>

        <nav className="gs-nav">
          {NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`gs-nav__link${pathname === item.path ? ' gs-nav__link--active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="gs-header__actions">
          <Link to="/admin/login" className="gs-header__admin">
            管理后台
          </Link>
          <a
            href="http://localhost:5173/sub_center/geo-spatial"
            className="gs-header__back"
            target="_blank"
            rel="noopener noreferrer"
          >
            ← 返回总中心
          </a>
        </div>
      </div>
    </header>
  )
}
