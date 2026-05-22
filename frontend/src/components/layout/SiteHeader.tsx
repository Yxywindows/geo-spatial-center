import { GlobalOutlined } from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { label: '首页', path: '/' },
  { label: '数据检索', path: '/search' },
  { label: '政策科普', path: '/policy' },
]

export default function SiteHeader() {
  const { pathname } = useLocation()

  return (
    <header className="gs-header">
      <div className="gs-header__inner">
        <Link to="/" className="gs-logo">
          <GlobalOutlined className="gs-logo__icon" />
          <div className="gs-logo__text">
            <span className="gs-logo__title">地理空间智能与人地系统</span>
            <span className="gs-logo__sub">科学数据分中心</span>
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

        <a
          href="http://localhost:5173/sub_center/geo-spatial"
          className="gs-header__back"
          target="_blank"
          rel="noopener noreferrer"
        >
          ← 返回总中心
        </a>
      </div>
    </header>
  )
}
