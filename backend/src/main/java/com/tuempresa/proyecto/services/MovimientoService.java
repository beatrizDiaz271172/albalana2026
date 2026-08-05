package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.dtos.MovimientoRequest;
import com.tuempresa.proyecto.models.*;
import com.tuempresa.proyecto.repositories.MovimientoRepository;
import com.tuempresa.proyecto.repositories.CamaraRepository;
import com.tuempresa.proyecto.repositories.LoteRepository;
import com.tuempresa.proyecto.repositories.ProductoRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final CamaraRepository camaraRepository;
    private final ProductoRepository productoRepository;
    private final LoteRepository loteRepository;

    public MovimientoService(MovimientoRepository movimientoRepository, CamaraRepository camaraRepository, 
        ProductoRepository productoRepository, LoteRepository loteRepository) {
        this.movimientoRepository = movimientoRepository;
        this.camaraRepository = camaraRepository;
        this.productoRepository = productoRepository;
        this.loteRepository = loteRepository;
    }

    public List<Movimiento> obtenerTodos() {
        List<Movimiento> movimientos= movimientoRepository.findAll();
        return movimientos;
    }

 
    public Movimiento guardarMovimiento(MovimientoRequest request) {
        Movimiento movimiento = new Movimiento();

        movimiento.setCdTipoMov(request.getCdTipoMov());
        movimiento.setFechaElaboracion(request.getFechaElaboracion());

        long idProducto = request.getCdProducto();
        Producto producto = productoRepository.getById(idProducto);
        movimiento.setProducto(producto);
        
        long idCamara= request.getCdCamara();        
        Camara camara = camaraRepository.getById(idCamara);
        movimiento.setCamara(camara);

        long idLote= request.getCdLote();        
        Lote lote = loteRepository.getById(idLote);
        movimiento.setCdLote(lote);
        
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

        return movimientoRepository.save(movimiento);
    }
}