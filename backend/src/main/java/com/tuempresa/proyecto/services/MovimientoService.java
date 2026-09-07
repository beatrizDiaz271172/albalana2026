package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.dtos.MovimientoRequest;
import com.tuempresa.proyecto.models.*;
import com.tuempresa.proyecto.repositories.MovimientoRepository;
import com.tuempresa.proyecto.repositories.CamaraRepository;
import com.tuempresa.proyecto.repositories.LoteRepository;
import com.tuempresa.proyecto.repositories.ProductoRepository;
import com.tuempresa.proyecto.repositories.StockRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class MovimientoService {

    // Código de tipo de movimiento que representa un INGRESO (suma al stock)/EGRESO (resta del stock)/AJUSTE(cambia stock)
    private static final long TIPO_MOV_INGRESO = 1L;
    private static final long TIPO_MOV_EGRESO = 2L;
    private static final long TIPO_MOV_AJUSTE = 3L;
    private static final long TIPO_MOV_TRANSFERENCIA = 4L;

    private static final int ALARMA_BAJA = 1;
    private static final int ALARMA_MEDIA = 2;
    private static final int ALARMA_ALTA = 3;
    private static final int ALARMA_CRITICA = 4;

    private static final int TIPO_ALARMA_SIN_MOV = 1;
    private static final int TIPO_ALARMA_STOCK = 2;
    private static final int TIPO_ALARMA_MADURACION = 4;
    private static final int TIPO_ALARMA_CONSUMO_VENC = 3;



    private final MovimientoRepository movimientoRepository;
    private final CamaraRepository camaraRepository;
    private final ProductoRepository productoRepository;
    private final LoteRepository loteRepository;
    private final StockRepository stockRepository;

    public MovimientoService(MovimientoRepository movimientoRepository, CamaraRepository camaraRepository, 
        ProductoRepository productoRepository, LoteRepository loteRepository, StockRepository stockRepository) {
        this.movimientoRepository = movimientoRepository;
        this.camaraRepository = camaraRepository;
        this.productoRepository = productoRepository;
        this.loteRepository = loteRepository;
        this.stockRepository = stockRepository;
    }

    public List<Movimiento> obtenerTodos() {
        List<Movimiento> movimientos= movimientoRepository.findByActivoTrue();
        return movimientos;
    }

    @Transactional
    public Lote crearYGuardarLote(String codigo, Producto producto, Camara camara, LocalDate fechaElab, Double hormas, Double kgs) {
        
        Lote nuevoLote = new Lote();
        nuevoLote.setCodigo(codigo);
        nuevoLote.setProducto(producto);
        nuevoLote.setCamara(camara);
        nuevoLote.setFechaElaboracion(fechaElab);
        BigDecimal res= BigDecimal.valueOf(kgs/hormas).setScale(2, RoundingMode.HALF_UP);;
        nuevoLote.setKgsXHorma(res.doubleValue());

        return loteRepository.save(nuevoLote);
    }
  
    @Transactional
    public Movimiento guardarMovimiento(MovimientoRequest request) {
        long tipoMov =  request.getCdTipoMov();
        boolean esIngreso = tipoMov == TIPO_MOV_INGRESO;
        boolean esAjuste =  tipoMov == TIPO_MOV_AJUSTE;
        boolean esTransferencia =  tipoMov == TIPO_MOV_TRANSFERENCIA;
        Movimiento movimiento = new Movimiento();

        movimiento.setCdTipoMov(request.getCdTipoMov());

        long idProducto = request.getCdProducto();
        Producto producto = productoRepository.getReferenceById(idProducto);
        //movimiento.setProducto(producto);
        
        String codigo = request.getCdLote();
        
        long idCamara=request.getCdCamara();
        Camara camara = camaraRepository.getReferenceById(idCamara);
        List<Lote> lotes =loteRepository.findByProducto_IdAndCamara_IdAndActivoTrue(idProducto, idCamara);
        List<Lote> lotesFiltrados = lotes.stream()
                                .filter(lotef -> lotef.getCodigo().equals(codigo))
                                .toList();

        Lote loteOrigen = null;
        if (lotesFiltrados.size()>0)
            loteOrigen = lotesFiltrados.get(0);
        
        Lote lote = null;

        if (esTransferencia){ //Ver si existe el codigo de Lote para Producto y Camara Destino 
            idCamara=request.getCdCamaraDestino();
            camara = camaraRepository.getReferenceById(idCamara);
            List<Lote> lotesDest =loteRepository.findByProducto_IdAndCamara_IdAndActivoTrue(idProducto, idCamara);
            List<Lote> lotesFiltradosDest = lotesDest.stream()
                                .filter(lotef -> lotef.getCodigo().equals(codigo))
                                .toList();

            if (lotesFiltradosDest.size()==0){
                lote = crearYGuardarLote(codigo, producto, camara, loteOrigen.getFechaElaboracion(), request.getHormas(), request.getKgs());
            } else {
                lote = lotesFiltradosDest.get(0);
            }
        }
        if (esIngreso){
            lote = crearYGuardarLote(codigo, producto, camara, request.getFechaElaboracion(), request.getHormas(), request.getKgs()); 
        }
        if (esAjuste){
            lote = loteOrigen;
        }
        movimiento.setLote(lote);        
        movimiento.setHormas(request.getHormas());
        movimiento.setKgs(request.getKgs());
        movimiento.setLtsLeche(request.getLtsLeche());
        movimiento.setFermento(request.getFermento());
        movimiento.setObs(request.getObs());
        movimiento.setCdOperador(request.getCdOperador());
        movimiento.setObs(request.getObs());
        movimiento.setMotivo(request.getMotivo());

        // Se asigna la fecha y hora de creación de forma automática
        movimiento.setFechaAlta(LocalDateTime.now());
        movimiento.setFechaEditado(request.getFechaElaboracion());
        Movimiento movimientoGuardado = movimientoRepository.save(movimiento);

        // Actualiza el stock (por cámara y producto) según el movimiento registrado
        actualizarStock(lote, tipoMov , request.getHormas(), request.getKgs(), loteOrigen);

        return movimientoGuardado;
    }

    /**
     * Actualiza (o crea) el registro de Stock correspondiente al lote
     * sumando o restando las hormas y kgs del movimiento
     * según su tipo (INGRESO suma, cualquier otro tipo se considera EGRESO y resta).
     */
    private void actualizarStock(Lote lote, Long cdTipoMov, Double hormas, Double kgs, Lote loteAnt) {
        double deltaHormas = hormas != null ? hormas : 0.0;
        double deltaKgs = kgs != null ? kgs : 0.0;

        boolean esIngreso = cdTipoMov != null && cdTipoMov == TIPO_MOV_INGRESO;
        boolean esAjuste = cdTipoMov != null && cdTipoMov == TIPO_MOV_AJUSTE;
        boolean esTransferencia =  cdTipoMov == TIPO_MOV_TRANSFERENCIA;
         Stock stock = stockRepository
                .findByLote_IdAndActivoTrue(lote.getId());;
        if (esAjuste) {
           /*  if (stock != null){
               stock.setActivo(false);
               stockRepository.save(stock);
               stock = null;
            }*/
        } else if (esTransferencia){
            Stock stockAnt = stockRepository.findByLote_IdAndActivoTrue(loteAnt.getId());;
            double hormasActuales = stockAnt.getHormas() != null ? stockAnt.getHormas() : 0.0;
            double kgsActuales = stockAnt.getKgs() != null ? stockAnt.getKgs() : 0.0;

            stockAnt.setHormas(hormasActuales - deltaHormas);
            
            double kgDeHormas = hormas * loteAnt.getKgsXHorma();
            stockAnt.setKgs(kgsActuales - kgDeHormas);
            stockAnt.setFechaEmision(LocalDateTime.now());
            stockRepository.save(stockAnt);
        }

        if (stock == null){
            stock = new Stock();
            stock.setLote(lote);
            stock.setFechaAlta(LocalDateTime.now());
        }                
        double hormasActuales = stock.getHormas() != null ? stock.getHormas() : 0.0;
        double kgsActuales = stock.getKgs() != null ? stock.getKgs() : 0.0;

        if (esTransferencia || esIngreso){
            stock.setHormas(hormasActuales + deltaHormas);
            stock.setKgs(kgsActuales + deltaKgs);
        }
        
        if (esAjuste){
            stock.setHormas( deltaHormas);
            stock.setKgs(deltaKgs);
        }
        stock.setFechaEmision(LocalDateTime.now());        

        stockRepository.save(stock);
    }

    public List<Alertas> obtenerAlertas(){
        List<Producto> productos = productoRepository.findByActivoTrue();
        List<Alertas> alertasMov = productosSinMovimiento(productos); //TIPO_ALARMA_SIN_MOV
        List<Alertas> alertasStock = stockBajo(productos); // TIPO_ALARMA_STOCK
        alertasMov.addAll(alertasStock);
        List<Alertas> alertasMaduracion  = maduracionLotes(productos); //TIPO_ALARMA_MADURACION
        alertasMov.addAll(alertasMaduracion);
        List<Alertas> alertasConsumoOpt  = consumoOptimo(productos); // TIPO_ALARMA_CONSUMO_VENC
        alertasMov.addAll(alertasConsumoOpt);
        
        return alertasMov;
    }

    private List<Alertas> consumoOptimo(List<Producto> productos){
        List<Alertas> alertas = new ArrayList<>();
        LocalDate fechaHoy = LocalDate.now();
        for (Producto producto : productos) {
            Long diasMaduracionProd = producto.getMaduracionDias();
            Long consumoOptDias = producto.getConsumoOptDias();

            List<Stock> stocks = stockRepository.findByLote_Producto_IdAndActivoTrue(producto.getId());
            if (stocks.size()>0){
                for (Stock stock : stocks) { 
                  if (stock.getHormas()>0 && stock.getLote().getActivo()){
                     LocalDate fechaElab = stock.getLote().getFechaElaboracion();
                     Long diasDesdeElab = ChronoUnit.DAYS.between(fechaElab, fechaHoy);
                     Long diasDif = diasDesdeElab - diasMaduracionProd;
                     if (diasDif > 0){
                      // Se paso de la Maduracion
                        Alertas alerta = new Alertas();
                        alerta.setProductoId(producto.getId());
                        alerta.setProductoNombre(producto.getNombre());
                        alerta.setLoteNombre(stock.getLote().getCodigo());
                      if (diasDif > consumoOptDias){
                        alerta.setDias(diasDif);
                        alerta.setMensajeAlerta("VENCIDO, consumo óptimo superado, pasaron: " + diasDif + " días desde la maduración.");
                        alerta.setNivelAlerta(ALARMA_CRITICA);
                        alerta.setTipoAlerta(TIPO_ALARMA_MADURACION);
                        alertas.add(alerta);
                      }
                      Long diasPorVencer = consumoOptDias - diasDif;
                      if (diasPorVencer >0 && diasPorVencer <= 14){
                        alerta.setDias(diasPorVencer);
                        alerta.setMensajeAlerta(stock.getLote().getCodigo()
                        + " vence en: " + diasPorVencer + " días.");
                        alerta.setNivelAlerta(ALARMA_ALTA);
                        alerta.setTipoAlerta(TIPO_ALARMA_MADURACION);
                        alertas.add(alerta);
                      }
                    
                     }
                  }
                }
            }
        }
        return alertas;
    }



    private List<Alertas> maduracionLotes(List<Producto> productos){
        List<Alertas> alertas = new ArrayList<>();
        LocalDate fechaHoy = LocalDate.now();
        for (Producto producto : productos) {
            Long diasMaduracionProd = producto.getMaduracionDias();
            Long diasPreMaduracion = producto.getPreMaduracionDias();
            Long diasPostMaduracion = producto.getPostMaduracionDias();
            List<Stock> stocks = stockRepository.findByLote_Producto_IdAndActivoTrue(producto.getId());
            if (stocks.size()>0){
                for (Stock stock : stocks) { 
                  if (stock.getHormas()>0 && stock.getLote().getActivo()){
                    LocalDate fechaElab = stock.getLote().getFechaElaboracion();
                    Long diasDesdeElab = ChronoUnit.DAYS.between(fechaElab, fechaHoy);
                    Long diasFaltanMad = diasMaduracionProd - diasDesdeElab;
                    String loteStr = stock.getLote().getCodigo();
                    if (diasFaltanMad >0  && diasFaltanMad <= diasPreMaduracion){
                        Alertas alerta = new Alertas();
                        alerta.setProductoId(producto.getId());
                        alerta.setProductoNombre(producto.getNombre());
                        alerta.setLoteNombre(stock.getLote().getCodigo());
                        alerta.setDias(diasFaltanMad);
                        alerta.setMensajeAlerta(loteStr + " faltan: " + diasFaltanMad + " días para madurar.");
                        alerta.setNivelAlerta(ALARMA_MEDIA);
                        alerta.setTipoAlerta(TIPO_ALARMA_MADURACION);
                        alertas.add(alerta);
                    } else if (diasFaltanMad <=0 && (-1) * diasFaltanMad > diasPostMaduracion ){
                        Alertas alerta = new Alertas();
                        alerta.setProductoId(producto.getId());
                        alerta.setProductoNombre(producto.getNombre());
                        alerta.setLoteNombre(stock.getLote().getCodigo());
                        alerta.setDias(diasFaltanMad);                        
                        alerta.setMensajeAlerta(loteStr + ": " + (-1) * diasFaltanMad + " días post-maduración.");
                        alerta.setNivelAlerta(ALARMA_ALTA);
                        alerta.setTipoAlerta(TIPO_ALARMA_MADURACION);
                        alertas.add(alerta);
                    }
                  }
                }
            }
        }
        return alertas;
    }

    private List<Alertas> productosSinMovimiento(List<Producto> productos){
        List<Alertas> alertas = new ArrayList<>();
        LocalDateTime fechaHoy = LocalDateTime.now();
        for (Producto producto : productos) {
        List<Movimiento> movimientos = movimientoRepository.findByLote_Producto_idAndActivoTrueOrderByIdDesc(producto.getId());
        if (movimientos.size()>0){
            Movimiento mov = movimientos.get(0);
            LocalDateTime fecha = mov.getFechaAlta();
            Long diasDeDiferencia = ChronoUnit.DAYS.between(fecha, fechaHoy);
            if (diasDeDiferencia > producto.getDiasSinMov()){
                Alertas alerta = new Alertas();
                alerta.setProductoId(producto.getId());
                alerta.setProductoNombre(producto.getNombre());
                alerta.setLoteNombre("");
                alerta.setDias(diasDeDiferencia);
                alerta.setMensajeAlerta("Sin Movimiento hace: " + diasDeDiferencia + " días");
                alerta.setNivelAlerta(ALARMA_MEDIA);
                alerta.setTipoAlerta(TIPO_ALARMA_SIN_MOV);
                alertas.add(alerta);
            }
        }   
        
    }
    return alertas;
    }

    private List<Alertas> stockBajo(List<Producto> productos){
        List<Alertas> alertas = new ArrayList<>();
         for (Producto producto : productos) {
            List<Stock> stocks = stockRepository.findByLote_Producto_IdAndActivoTrue(producto.getId());
            Double totalHormas = 0.00;
            for (Stock stock : stocks) {
                totalHormas += stock.getHormas();
            }
            Alertas alerta = null;;
            if (totalHormas < 0) {
                alerta = new Alertas();
                alerta.setProductoId(producto.getId());
                alerta.setProductoNombre(producto.getNombre());
                alerta.setLoteNombre("");
                alerta.setHormas(totalHormas);
                alerta.setMensajeAlerta("STOCK NEGATIVO: " + totalHormas);
                alerta.setNivelAlerta(ALARMA_CRITICA);
                alerta.setTipoAlerta(TIPO_ALARMA_STOCK);
            } else if(totalHormas < producto.getStockMinimo()){
                alerta = new Alertas();
                alerta.setProductoId(producto.getId());
                alerta.setProductoNombre(producto.getNombre());
                alerta.setLoteNombre("");
                alerta.setHormas(totalHormas);
                alerta.setMensajeAlerta("STOCK BAJO: " + totalHormas + "  (min: " + producto.getStockMinimo() + ")");
                alerta.setNivelAlerta(ALARMA_ALTA);
                alerta.setTipoAlerta(TIPO_ALARMA_STOCK);
            }
            if (alerta != null){
                alertas.add(alerta);
            }
         }
        return alertas;
    }
}

