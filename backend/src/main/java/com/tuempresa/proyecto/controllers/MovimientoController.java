package com.tuempresa.proyecto.controllers;

import com.tuempresa.proyecto.dtos.MovimientoRequest;
import com.tuempresa.proyecto.models.*;
import com.tuempresa.proyecto.services.MovimientoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimientos")

public class MovimientoController {

    private final MovimientoService movimientoService;

    public MovimientoController(MovimientoService MovimientoService) {
        this.movimientoService = MovimientoService;
    }

    @GetMapping
    public ResponseEntity<List<Movimiento>> listarMovimientos() {
        return ResponseEntity.ok(movimientoService.obtenerTodos());
    }

    @GetMapping("/alertas")
    public ResponseEntity<List<Alertas>> obtenerAlertas() {
        List<Alertas> alertas = movimientoService.obtenerAlertas();
        return ResponseEntity.ok(alertas);
    }

    @PostMapping
    public ResponseEntity<Movimiento> crearMovimiento(@RequestBody MovimientoRequest request) {
        Movimiento nuevoMovimiento = movimientoService.guardarMovimiento(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoMovimiento);
    }
}