import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegistrarIngreso from './pages/RegistrarIngreso';
import RegistrarEgresoRemito from './pages/RegistrarEgresoRemito';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/registrarIngreso" element={<RegistrarIngreso />} />
        <Route path="/registrarEgresoRemito" element={<RegistrarEgresoRemito />} />
      </Routes>
    </BrowserRouter>
  );
}
