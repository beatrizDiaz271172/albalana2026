package com.tuempresa.proyecto.controllers;

import com.tuempresa.proyecto.services.EliminacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class EliminacionController {

    private final EliminacionService service;

    public EliminacionController(EliminacionService service) {
        this.service = service;
    }

    @DeleteMapping("/productos/{id}")
    public ResponseEntity<Void> producto(@PathVariable Long id) {
        service.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/camaras/{id}")
    public ResponseEntity<Void> camara(@PathVariable Long id) {
        service.eliminarCamara(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clientes/{id}")
    public ResponseEntity<Void> cliente(@PathVariable Long id) {
        service.eliminarCliente(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/operadores/{id}")
    public ResponseEntity<Void> operador(@PathVariable Long id) {
        service.eliminarOperador(id);
        return ResponseEntity.noContent().build();
    }
}