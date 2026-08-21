package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.dtos.ProductoRequest;
import com.tuempresa.proyecto.dtos.UsuarioRequest;
import com.tuempresa.proyecto.models.Producto;
import com.tuempresa.proyecto.models.Usuario;
import com.tuempresa.proyecto.repositories.*;
import org.springframework.stereotype.Service;

import java.util.List;

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
}