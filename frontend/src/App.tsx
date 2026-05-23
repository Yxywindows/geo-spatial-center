import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import PolicyPage from './pages/PolicyPage'
import ResourceDetailPage from './pages/ResourceDetailPage'
import ScienceDetailPage from './pages/ScienceDetailPage'
import PolicyDetailPage from './pages/PolicyDetailPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/policy" element={<PolicyPage />} />
          <Route path="/policy/file/:id" element={<PolicyDetailPage />} />
          <Route path="/policy/science/:id" element={<ScienceDetailPage />} />
          <Route path="/resource/:sourceId" element={<ResourceDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  )
}
