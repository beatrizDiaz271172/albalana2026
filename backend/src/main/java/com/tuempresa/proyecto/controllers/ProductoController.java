package com.tuempresa.proyecto.controllers;

import java.util.List; // 👈 Importación que faltaba

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tuempresa.proyecto.dtos.ProductoRequest;

import com.tuempresa.proyecto.models.Producto;
import com.tuempresa.proyecto.models.Remito;
import com.tuempresa.proyecto.models.Usuario;
import com.tuempresa.proyecto.repositories.ProductoRepository;
import com.tuempresa.proyecto.services.ProductoService;

@RestController
@RequestMapping("/api/productos")

public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public ResponseEntity<List<Producto>> obtenerTodas() {
        List<Producto> productos = productoService.obtenerTodos();
        return ResponseEntity.ok(productos);
    }

    @PostMapping
    public ResponseEntity<Producto> crearProducto(@RequestBody ProductoRequest request) {
        Producto nuevoProducto = productoService.guardarProducto(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
    }

}

    
