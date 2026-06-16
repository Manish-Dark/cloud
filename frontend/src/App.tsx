import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import { CustomThemeProvider } from './ThemeContext';
import Layout from './components/Layout';
import StoragesList from './pages/StoragesList';
import StorageRegister from './pages/StorageRegister';
import WorkersList from './pages/WorkersList';
import WorkerRegister from './pages/WorkerRegister';
import StorageFiles from './pages/StorageFiles';


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};



const App: React.FC = () => {
  return (
    <CustomThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Navigate to="/storages" replace />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/storages" element={<ProtectedRoute><Layout><StoragesList /></Layout></ProtectedRoute>} />
          <Route path="/storages/register" element={<ProtectedRoute><Layout><StorageRegister /></Layout></ProtectedRoute>} />
          <Route path="/storages/:id/files" element={<ProtectedRoute><Layout><StorageFiles /></Layout></ProtectedRoute>} />
          <Route path="/storage_workers" element={<ProtectedRoute><Layout><WorkersList /></Layout></ProtectedRoute>} />
          <Route path="/storage_workers/register" element={<ProtectedRoute><Layout><WorkerRegister /></Layout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </CustomThemeProvider>
  );
};

export default App;
