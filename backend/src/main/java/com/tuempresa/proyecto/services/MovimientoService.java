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
import java.util.List;

@Service
public class MovimientoService {

    // Código de tipo de movimiento que representa un INGRESO (suma al stock)/EGRESO (resta del stock)/AJUSTE(cambia stock)
    private static final long TIPO_MOV_INGRESO = 1L;
    private static final long TIPO_MOV_EGRESO = 2L;
    private static final long TIPO_MOV_AJUSTE = 3L;
    private static final long TIPO_MOV_TRANSFERENCIA = 4L;

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
        List<Movimiento> movimientos= movimientoRepository.findAll();
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
        boolean esAjuste =  request.getCdTipoMov()== TIPO_MOV_AJUSTE;
        boolean esTransferencia =  request.getCdTipoMov()== TIPO_MOV_TRANSFERENCIA;
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

        Lote loteAnt = null;
        if (lotesFiltrados.size()>0)
            loteAnt = lotesFiltrados.get(0);
        
      
        Lote lote = null;
        if (esAjuste){
            lote = loteAnt;
            Double kgsXHorma = request.getKgs() / request.getHormas();
            BigDecimal res = BigDecimal.valueOf(kgsXHorma).setScale(2, RoundingMode.HALF_UP);;
            kgsXHorma = res.doubleValue();

            lote.setKgsXHorma(kgsXHorma);
            lote = loteRepository.save(lote);
        } else {
            if (esTransferencia){
                idCamara=request.getCdCamaraDestino();
                camara = camaraRepository.getReferenceById(idCamara);
            }
            lote = crearYGuardarLote(codigo, producto, camara, request.getFechaElaboracion(), request.getHormas(), request.getKgs()); 
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
        Movimiento movimientoGuardado = movimientoRepository.save(movimiento);

        // Actualiza el stock (por cámara y producto) según el movimiento registrado
        actualizarStock(lote, request.getCdTipoMov(), request.getHormas(), request.getKgs(), loteAnt);

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
            if (stock != null){
               stock.setActivo(false);
               stockRepository.save(stock);
               stock = null;
            }
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

        if (esTransferencia){
            stock.setHormas(deltaHormas);
            stock.setKgs(deltaKgs);
        } else if (esIngreso){
            stock.setHormas(hormasActuales + deltaHormas);
            stock.setKgs(kgsActuales + deltaKgs);
        } else if (esAjuste){
            stock.setHormas( deltaHormas);
            stock.setKgs(deltaKgs);
        }
        stock.setFechaEmision(LocalDateTime.now());        

        stockRepository.save(stock);
    }
}