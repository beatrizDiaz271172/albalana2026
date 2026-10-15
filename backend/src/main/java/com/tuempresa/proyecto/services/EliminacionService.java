package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.exceptions.ReferenciaExistenteException;
import com.tuempresa.proyecto.repositories.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EliminacionService {

    private final ProductoRepository productoRepository;
    private final CamaraRepository camaraRepository;
    private final ClienteRepository clienteRepository;
    private final OperadorRepository operadorRepository;
    private final LoteRepository loteRepository;
    private final RemitoRepository remitoRepository;
    private final MovimientoRepository movimientoRepository;

    public EliminacionService(ProductoRepository productoRepository, CamaraRepository camaraRepository,
                              ClienteRepository clienteRepository, OperadorRepository operadorRepository,
                              LoteRepository loteRepository, RemitoRepository remitoRepository,
                              MovimientoRepository movimientoRepository) {
        this.productoRepository = productoRepository;
        this.camaraRepository = camaraRepository;
        this.clienteRepository = clienteRepository;
        this.operadorRepository = operadorRepository;
        this.loteRepository = loteRepository;
        this.remitoRepository = remitoRepository;
        this.movimientoRepository = movimientoRepository;
    }

    @Transactional
    public void eliminarProducto(Long id) {
        var p = productoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con ID: " + id));
        if (loteRepository.existsByProducto_Id(id))
            throw new ReferenciaExistenteException(
                "No se puede eliminar el producto porque está asociado a lotes, stock o movimientos existentes.");
        borrar(productoRepository, p, "el producto");
    }

    @Transactional
    public void eliminarCamara(Long id) {
        var c = camaraRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cámara no encontrada con ID: " + id));
        if (loteRepository.existsByCamara_Id(id))
            throw new ReferenciaExistenteException(
                "No se puede eliminar la cámara porque tiene lotes, stock o movimientos asociados.");
        borrar(camaraRepository, c, "la cámara");
    }

    @Transactional
    public void eliminarCliente(Long id) {
        var c = clienteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cliente no encontrado con ID: " + id));
        if (remitoRepository.existsByCliente_Id(id))
            throw new ReferenciaExistenteException(
                "No se puede eliminar el cliente porque está asociado a remitos existentes.");
        borrar(clienteRepository, c, "el cliente");
    }

    @Transactional
    public void eliminarOperador(Long id) {
        var o = operadorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Operador no encontrado con ID: " + id));
        if (remitoRepository.existsByOperador_Id(id) || movimientoRepository.existsByCdOperador(id))
            throw new ReferenciaExistenteException(
                "No se puede eliminar el operador porque está asociado a remitos o movimientos existentes.");
        borrar(operadorRepository, o, "el operador");
    }

    // flush() fuerza el error de FK dentro del try, y no recién en el commit
    private <T> void borrar(JpaRepository<T, Long> repo, T entidad, String nombre) {
        try {
            repo.delete(entidad);
            repo.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ReferenciaExistenteException(
                "No se puede eliminar " + nombre + " porque está asociado a otros registros del sistema.");
        }
    }
}