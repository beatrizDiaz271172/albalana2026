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
import DefinicionesSistOpc from './pages/DefinicionesSistOpc';
import ConsultarItemsRemito from './pages/ConsultarItemsRemito';
import MermasYPesoProm from './pages/MermasYPesoProm';
import DefinicionesSistemaCamara from './pages/DefinicionesSistemaCamara';
import ListaQuesos from './pages/ListaQuesos';
import GestionCampañas from './pages/GestionCampañas';

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
        <Route path="/definicionesSistOpc" element={<DefinicionesSistOpc />} />

        <Route path="/definicionesSistema" element={<DefinicionesSistema />} />
        <Route path="/lotes/producto/:idProducto" element={<DefinicionesSistema />} />

        <Route path="/definicionesSistemaCamara" element={<DefinicionesSistemaCamara />} />
        <Route path="/camaras/:idCamara" element={<DefinicionesSistemaCamara />} />

        <Route path="/mermasYPesoProm" element={<MermasYPesoProm />} />
        <Route path="/productos/mermas" element={<MermasYPesoProm />} />

        <Route path="/remitos/:remitoId/items" element={<ConsultarItemsRemito />} />
        <Route path="/remitos/:remitoId" element={<ConsultarItemsRemito />} />
        
        <Route path="/movimientos/alertas" element={<Dashboard />} />
        <Route path="/listaQuesos" element={<ListaQuesos />} />

        <Route path="/gestionCampañas" element={<GestionCampañas />} />
        
 
      </Routes>
    </BrowserRouter>
  );
}
