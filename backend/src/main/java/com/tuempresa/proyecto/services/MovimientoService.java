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
import java.time.*;
import java.util.List;

@Service
public class MovimientoService {

    // Código de tipo de movimiento que representa un INGRESO (suma al stock).
    // Cualquier otro valor de cdTipoMov se trata como EGRESO (resta del stock).
    private static final long TIPO_MOV_INGRESO = 1L;

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
    public Lote crearYGuardarLote(String codigo, Producto producto, Camara camara, LocalDate fechaElab) {
        
        Lote nuevoLote = new Lote();
        nuevoLote.setCodigo(codigo);
        nuevoLote.setProducto(producto);
        nuevoLote.setCamara(camara);
        nuevoLote.setFechaElaboracion(fechaElab);

        return loteRepository.save(nuevoLote);
    }
  
    @Transactional
    public Movimiento guardarMovimiento(MovimientoRequest request) {
        Movimiento movimiento = new Movimiento();

        movimiento.setCdTipoMov(request.getCdTipoMov());
       // movimiento.setFechaElaboracion(request.getFechaElaboracion());

        long idProducto = request.getCdProducto();
        Producto producto = productoRepository.getReferenceById(idProducto);
        //movimiento.setProducto(producto);
        
        long idCamara= request.getCdCamara();        
        Camara camara = camaraRepository.getReferenceById(idCamara);
       //movimiento.setCamara(camara);
 
        String codigo = request.getCdLote();
        Lote lote = crearYGuardarLote(codigo, producto, camara, request.getFechaElaboracion()); 
        movimiento.setLote(lote);
        
        movimiento.setHormas(request.getHormas());
        movimiento.setKgs(request.getKgs());
        movimiento.setLtsLeche(request.getLtsLeche());
        movimiento.setFermento(request.getFermento());
        movimiento.setObs(request.getObs());
        movimiento.setCdOperador(request.getCdOperador());
       // movimiento.setCdCliente(request.getCdCliente());
        movimiento.setMotivo(request.getMotivo());

        // Se asigna la fecha y hora de creación de forma automática
        movimiento.setFechaAlta(LocalDateTime.now());

        Movimiento movimientoGuardado = movimientoRepository.save(movimiento);

        // Actualiza el stock (por cámara y producto) según el movimiento registrado
        //actualizarStock(producto, camara, request.getCdTipoMov(), request.getHormas(), request.getKgs());
        actualizarStock(lote, request.getCdTipoMov(), request.getHormas(), request.getKgs());

        return movimientoGuardado;
    }

    /**
     * Actualiza (o crea) el registro de Stock correspondiente al lote
     * sumando o restando las hormas y kgs del movimiento
     * según su tipo (INGRESO suma, cualquier otro tipo se considera EGRESO y resta).
     */
    private void actualizarStock(Lote lote, Long cdTipoMov, Double hormas, Double kgs) {
        double deltaHormas = hormas != null ? hormas : 0.0;
        double deltaKgs = kgs != null ? kgs : 0.0;

        boolean esIngreso = cdTipoMov != null && cdTipoMov == TIPO_MOV_INGRESO;
        if (!esIngreso) {
            deltaHormas = -deltaHormas;
            deltaKgs = -deltaKgs;
        }

        Stock stock = stockRepository
                .findById(lote.getId())
                .orElseGet(() -> Stock.builder()
                        .lote(lote)
                        .hormas(0.0)
                        .kgs(0.0)
                        .fechaAlta(LocalDateTime.now())
                        .build());

        double hormasActuales = stock.getHormas() != null ? stock.getHormas() : 0.0;
        double kgsActuales = stock.getKgs() != null ? stock.getKgs() : 0.0;

        stock.setHormas(hormasActuales + deltaHormas);
        stock.setKgs(kgsActuales + deltaKgs);
        stock.setFechaEmision(LocalDateTime.now());

        stockRepository.save(stock);
    }
}