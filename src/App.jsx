import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import RoulettePage from './pages/RoulettePage';
import GalleryPage from './pages/GalleryPage';
import ReasonsPage from './pages/ReasonsPage';
import BucketListPage from './pages/BucketListPage';
import ExpensesPage from './pages/ExpensesPage';
import MemoryBookPage from './pages/MemoryBookPage';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="reasons" element={<ReasonsPage />} />
              <Route path="roulette" element={<RoulettePage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="bucket-list" element={<BucketListPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="memories" element={<MemoryBookPage />} />
              <Route path="calendar" element={<CalendarPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
