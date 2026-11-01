import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import MarketplacePage from './pages/MarketplacePage'
import ContributePage from './pages/ContributePage'
import ChangelogPage from './pages/ChangelogPage'
import DocsPage from './pages/DocsPage'

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false)
  const handleSearchOpen = useCallback(() => setSearchOpen(true), [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onSearchOpen={handleSearchOpen} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/contribute" element={<ContributePage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/docs" element={<DocsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
