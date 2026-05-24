import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import PolicyPage from './pages/PolicyPage'
import ComingSoonPage from './pages/ComingSoonPage'
import ResourceDetailPage from './pages/ResourceDetailPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import ReviewListPage from './pages/admin/ReviewListPage'
import ReviewDetailPage from './pages/admin/ReviewDetailPage'
import ReviewPublicationsPage from './pages/admin/ReviewPublicationsPage'
import { isAdminAuthed } from './store/adminAuth'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  useEffect(() => {
    if (!isAdminAuthed()) {
      navigate('/admin/login', { replace: true })
    }
  }, [navigate])
  if (!isAdminAuthed()) return null
  return <>{children}</>
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* 公开前台页面 */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/featured" element={<ComingSoonPage title="特色数据" />} />
          <Route path="/policy" element={<PolicyPage />} />
          <Route path="/about" element={<ComingSoonPage title="关于本站" />} />
          <Route path="/resource/:sourceId" element={<ResourceDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* 分管理员后台 */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/review"
          element={
            <RequireAdmin>
              <ReviewListPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/review/:id"
          element={
            <RequireAdmin>
              <ReviewDetailPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/publications"
          element={
            <RequireAdmin>
              <ReviewPublicationsPage />
            </RequireAdmin>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/review" replace />} />
      </Routes>
    </>
  )
}
