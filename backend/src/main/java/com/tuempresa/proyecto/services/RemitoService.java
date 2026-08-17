package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.dtos.ItemRemitoRequest;
import com.tuempresa.proyecto.dtos.RemitoRequest;
import com.tuempresa.proyecto.models.*;
import com.tuempresa.proyecto.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RemitoService {

    // Código de tipo de movimiento que representa un EGRESO (resta del stock).
    // Debe coincidir con el criterio usado en MovimientoService (allí solo el
    // código 1 = INGRESO; cualquier otro código, incluido este, resta stock).
    private static final long TIPO_MOV_EGRESO = 2L;

    private final RemitoRepository remitoRepository;
    private final ClienteRepository clienteRepository;
    private final MovimientoRepository movimientoRepository;
    private final ProductoRepository productoRepository;
    private final CamaraRepository camaraRepository;
    private final StockRepository stockRepository;
    private final LoteRepository loteRepository;

    public RemitoService(RemitoRepository remitoRepository,
                          ClienteRepository clienteRepository,
                          MovimientoRepository movimientoRepository,
                          ProductoRepository productoRepository,
                          CamaraRepository camaraRepository,
                          StockRepository stockRepository,
                        LoteRepository loteRepository) {
        this.remitoRepository = remitoRepository;
        this.clienteRepository = clienteRepository;
        this.movimientoRepository = movimientoRepository;
        this.productoRepository = productoRepository;
        this.camaraRepository = camaraRepository;
        this.stockRepository = stockRepository;
        this.loteRepository = loteRepository;
    }

    public List<Remito> obtenerTodos() {
        return remitoRepository.findAll();
    }

    @Transactional
    public Remito guardarRemito(RemitoRequest request) {
        Remito remito = new Remito();
        remito.setFechaEgreso(request.getFechaEgreso());
        remito.setCdOperador(request.getCdOperador());
        remito.setObservaciones(request.getObservaciones());
        remito.setFechaAlta(LocalDateTime.now());

        if (request.getCdCliente() != null) {
            Cliente cliente = clienteRepository.getById(request.getCdCliente());
            remito.setCliente(cliente);
        }

        Remito remitoGuardado = remitoRepository.save(remito);

        if (request.getItems() != null) {
            for (ItemRemitoRequest item : request.getItems()) {
                registrarItem(remitoGuardado, request, item);
            }
        }

        return remitoGuardado;
    }

    /**
     * Por cada item del remito se genera un Movimiento de tipo EGRESO
     * (asociado al remito mediante cdRemito) y se descuenta el stock
     * correspondiente a la combinación producto + cámara.
     */
    private void registrarItem(Remito remito, RemitoRequest request, ItemRemitoRequest item) {
        Producto producto = productoRepository.getById(item.getCdProducto());
        Camara camara = camaraRepository.getById(item.getCdCamara());

        Movimiento movimiento = new Movimiento();
        movimiento.setCdTipoMov(TIPO_MOV_EGRESO);
        //movimiento.setFechaElaboracion(request.getFechaEgreso());
        Lote lote = loteRepository.findByCodigo(item.getCdLote());
        movimiento.setLote(lote);
        movimiento.setHormas(item.getHormas());
        movimiento.setKgs(item.getKgs());
        movimiento.setCdOperador(request.getCdOperador());
        movimiento.setObs(request.getObservaciones());
        movimiento.setRemito(remito);
        movimiento.setFechaAlta(LocalDateTime.now());

        movimientoRepository.save(movimiento);

        actualizarStock(lote, item.getHormas(), item.getKgs());
    }

        private void actualizarStock(Lote lote, Double hormas, Double kgs) {
        double deltaHormas = hormas != null ? -hormas : 0.0;
        double deltaKgs = kgs != null ? -kgs : 0.0;

        Stock stock = stockRepository
                .findByLote_IdAndActivoTrue(lote.getId());

        double hormasActuales = stock.getHormas() != null ? stock.getHormas() : 0.0;
        double kgsActuales = stock.getKgs() != null ? stock.getKgs() : 0.0;

        stock.setHormas(hormasActuales + deltaHormas);
        stock.setKgs(kgsActuales + deltaKgs);
        stock.setFechaEmision(LocalDateTime.now());

        stockRepository.save(stock);
    }
}
