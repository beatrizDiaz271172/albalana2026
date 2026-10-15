// IDs del Sidebar -> rutas reales de App.jsx
export const RUTAS_SIDEBAR = {
  inicio: '/dashboard',                 // antes '/', que redirige a /login
  stock_actual: '/stockProductoCamaras',
  maduracion_lotes: '/estadoMaduracionLoteCamara',
  mermas: '/mermasYPesoProm',
  ingreso_produccion: '/registrarIngreso',
  egreso_remito: '/registrarEgresoRemito',
  ajuste_stock: '/ajusteStock',
  transferencia: '/transferenciaEntreCamaras',
  historial_movimientos: '/historialMovimientos',
  remitos: '/remitoCliente',
  definiciones: '/definicionesSistOpc',
  campanias: '/gestionCampanias',
  imprimir_pdf: '/reporteImprimible',
  // red_local no tiene ruta en App.jsx (ver notas)
};