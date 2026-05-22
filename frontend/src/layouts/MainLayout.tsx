import { Outlet } from 'react-router-dom'
import SiteHeader from '../components/layout/SiteHeader'
import SiteFooter from '../components/layout/SiteFooter'

export default function MainLayout() {
  return (
    <div className="gs-site">
      <SiteHeader />
      <main className="gs-main">
        <div className="gs-page">
          <Outlet />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
