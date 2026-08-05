package com.tuempresa.proyecto.controllers;

import com.tuempresa.proyecto.dtos.MovimientoRequest;
import com.tuempresa.proyecto.models.Movimiento;
import com.tuempresa.proyecto.services.MovimientoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimientos")

public class MovimientoController {

    private final MovimientoService MovimientoService;

    public MovimientoController(MovimientoService MovimientoService) {
        this.MovimientoService = MovimientoService;
    }

    @GetMapping
    public ResponseEntity<List<Movimiento>> listarMovimientos() {
        return ResponseEntity.ok(MovimientoService.obtenerTodos());
    }

    @PostMapping
    public ResponseEntity<Movimiento> crearMovimiento(@RequestBody MovimientoRequest request) {
        Movimiento nuevoMovimiento = MovimientoService.guardarMovimiento(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoMovimiento);
    }
}