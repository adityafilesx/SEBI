import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import DocumentViewer from './pages/DocumentViewer';
import ReviewConsole from './pages/ReviewConsole';
import ObligationRegister from './pages/ObligationRegister';
import Workflows from './pages/Workflows';
import AuditReport from './pages/AuditReport';
import Landing from './pages/Landing';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 240, minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents/:id" element={<DocumentViewer />} />
          <Route path="/review" element={<ReviewConsole />} />
          <Route path="/obligations" element={<ObligationRegister />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/audit" element={<AuditReport />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}
