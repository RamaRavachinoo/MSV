import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import RoulettePage from './pages/RoulettePage';
import GalleryPage from './pages/GalleryPage';
import ReasonsPage from './pages/ReasonsPage';

// Placeholder pages to prevent errors before they are built
const Placeholder = ({ title }) => (
  <div className="p-8 text-center">
    <h2 className="text-2xl font-serif text-romantic-600 mb-4">{title}</h2>
    <p>Próximamente...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="reasons" element={<ReasonsPage />} />
          <Route path="roulette" element={<RoulettePage />} />
          <Route path="gallery" element={<GalleryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
