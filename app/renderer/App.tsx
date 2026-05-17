import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import EventDashboard from './pages/EventDashboard'
import Checklist from './pages/Checklist'
import Layout from './components/Layout'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:eventId" element={<EventDashboard />} />
        <Route path="/event/:eventId/checklist" element={<Checklist />} />
      </Routes>
    </Layout>
  )
}
