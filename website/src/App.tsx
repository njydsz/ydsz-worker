import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ExpertsPage from './pages/ExpertsPage'
import PluginsPage from './pages/PluginsPage'
import ContributePage from './pages/ContributePage'
import ChangelogPage from './pages/ChangelogPage'
import DocsRedirect from './pages/DocsRedirect'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/experts" element={<ExpertsPage />} />
          <Route path="/plugins" element={<PluginsPage />} />
          <Route path="/contribute" element={<ContributePage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/docs" element={<DocsRedirect />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
