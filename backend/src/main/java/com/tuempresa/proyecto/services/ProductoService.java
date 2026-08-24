package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.dtos.ProductoRequest;
import com.tuempresa.proyecto.models.Producto;
import com.tuempresa.proyecto.repositories.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> obtenerTodos() {
        List<Producto> productos= productoRepository.findAll();
        return productos;
    }

    public Producto guardarProducto(ProductoRequest request) {
        Producto producto = new Producto(request.getNombre(), request.getCodigo(), request.getMaduracionDias(),
        request.getConsumoOptDias(), request.getStockMinimo());
        return productoRepository.save(producto);
    }
    public Producto actualizarProducto(Long id, ProductoRequest request) {
    Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + id));
    
    // ✅ Validar que el nombre no esté duplicado (excepto el actual)
    if (!producto.getNombre().equalsIgnoreCase(request.getNombre())) {
        boolean nombreDuplicado = productoRepository.existsByNombreIgnoreCase(request.getNombre());
        if (nombreDuplicado) {
            throw new IllegalArgumentException("El nombre de producto ya existe");
        }
    }
    
    // Actualizar campos
    producto.setNombre(request.getNombre());
    producto.setCodigo(request.getCodigo());
    producto.setMaduracionDias(request.getMaduracionDias());
    producto.setConsumoOptDias(request.getConsumoOptDias());
    producto.setStockMinimo(request.getStockMinimo());
    
    return productoRepository.save(producto);
}
}