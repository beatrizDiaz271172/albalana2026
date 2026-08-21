import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegistrarIngreso from './pages/RegistrarIngreso';
import RegistrarEgresoRemito from './pages/RegistrarEgresoRemito';
import AjusteStock from './pages/AjusteStock';
import TransferenciaEntreCamaras from './pages/TransferenciaEntreCamaras';
import HistorialMovimientos from './pages/HistorialMovimientos';
import StockProductoCamaras from './pages/StockProductoCamaras';
import RemitoCliente from './pages/RemitoCliente';
import EstadoMaduracionLoteCamara from './pages/EstadoMaduracionLoteCamara';
import DefinicionesSistema from './pages/DefinicionesSistema';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/registrarIngreso" element={<RegistrarIngreso />} />
        <Route path="/registrarEgresoRemito" element={<RegistrarEgresoRemito />} />
        <Route path="/ajusteStock" element={<AjusteStock />} />
        <Route path="/transferenciaEntreCamaras" element={<TransferenciaEntreCamaras />} />
        <Route path="/historialMovimientos" element={<HistorialMovimientos />} />     
        <Route path="/stockProductoCamaras" element={<StockProductoCamaras />} />   
        <Route path="/remitoCliente" element={<RemitoCliente />} />
        <Route path="/estadoMaduracionLoteCamara" element={<EstadoMaduracionLoteCamara />} />
        <Route path="/definicionesSistema" element={<DefinicionesSistema />} />
      </Routes>
    </BrowserRouter>
  );
}
