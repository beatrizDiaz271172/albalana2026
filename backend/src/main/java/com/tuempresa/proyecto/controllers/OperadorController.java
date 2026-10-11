package com.tuempresa.proyecto.controllers;

import com.tuempresa.proyecto.dtos.OperadorRequest;
import com.tuempresa.proyecto.models.Operador;
import com.tuempresa.proyecto.repositories.OperadorRepository;
import com.tuempresa.proyecto.services.OperadorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/operadores")
public class OperadorController {

    private final OperadorRepository operadorRepository;
    private final OperadorService operadorService;

    public OperadorController(OperadorRepository operadorRepository, OperadorService operadorService) {
        this.operadorRepository = operadorRepository;
        this.operadorService = operadorService;
    }

    // GET: solo operadores activos
    @GetMapping
    public ResponseEntity<List<Operador>> obtenerTodos() {
        return ResponseEntity.ok(operadorService.obtenerActivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Operador> obtenerPorId(@PathVariable Long id) {
        return operadorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Operador> crearOperador(@RequestBody OperadorRequest request) {
        Operador nuevo = operadorService.crearOperador(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Operador> updateOperador(@PathVariable Long id, @RequestBody OperadorRequest request) {
        return ResponseEntity.ok(operadorService.actualizarOperador(id, request));
    }

    // Devuelve el mensaje de validación al frontend (400 en vez de 500)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleValidacion(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
    }
}