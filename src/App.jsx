import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RoulettePage = lazy(() => import('./pages/RoulettePage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const ReasonsPage = lazy(() => import('./pages/ReasonsPage'));
const BucketListPage = lazy(() => import('./pages/BucketListPage'));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'));
const MemoryBookPage = lazy(() => import('./pages/MemoryBookPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const LoveLetterPage = lazy(() => import('./pages/LoveLetterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OurThingsHome = lazy(() => import('./pages/OurThings/OurThingsHome'));
const CategoryView = lazy(() => import('./pages/OurThings/CategoryView'));
const FlowerGardenPage = lazy(() => import('./pages/FlowerGardenPage'));
const ResourcesHome = lazy(() => import('./pages/Resources/ResourcesHome'));
const FolderView = lazy(() => import('./pages/Resources/FolderView'));
const CareerPage = lazy(() => import('./pages/CareerPage'));

// Loading Fallback Component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-romantic-200 border-t-romantic-500 rounded-full animate-spin"></div>
      <p className="text-romantic-400 font-serif animate-pulse">Cargando amor...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/flowers" element={<FlowerGardenPage />} />
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="reasons" element={<ReasonsPage />} />
                <Route path="roulette" element={<RoulettePage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="bucket-list" element={<BucketListPage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="memories" element={<MemoryBookPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="love-letter" element={<LoveLetterPage />} />
                <Route path="our-things" element={<OurThingsHome />} />
                <Route path="our-things/:categoryId" element={<CategoryView />} />
                <Route path="resources" element={<ResourcesHome />} />
                <Route path="resources/:folderId" element={<FolderView />} />
                <Route path="carrera" element={<CareerPage />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
