package com.tuempresa.proyecto.controllers;

import java.util.List; // 👈 Importación que faltaba
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.tuempresa.proyecto.models.Producto;
import com.tuempresa.proyecto.repositories.ProductoRepository;

@RestController
@RequestMapping("/api/productos")

public class ProductoController {

    private final ProductoRepository productoRepository;

    public ProductoController(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @GetMapping
    public ResponseEntity<List<Producto>> obtenerTodas() {
        List<Producto> productos = productoRepository.findAll();
        return ResponseEntity.ok(productos);
    }
}

    
