import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import EventDashboard from './pages/EventDashboard'
import Checklist from './pages/Checklist'
import Bills from './pages/bills/Bills'
import BillPayments from './pages/bills/BillPayments'
import BillDashboard from './pages/bills/BillDashboard'
import Layout from './components/Layout'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/event/:eventId" element={<EventDashboard />} />
        <Route path="/event/:eventId/checklist" element={<Checklist />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/bills/payments" element={<BillPayments />} />
        <Route path="/bills/dashboard" element={<BillDashboard />} />
      </Routes>
    </Layout>
  )
}
