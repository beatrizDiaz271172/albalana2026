package com.tuempresa.proyecto.controllers;

import com.tuempresa.proyecto.models.Operador;
import com.tuempresa.proyecto.repositories.OperadorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operadores")

public class OperadorController {

    private final OperadorRepository operadorRepository;

    // Inyección de dependencias por constructor
    public OperadorController(OperadorRepository operadorRepository) {
        this.operadorRepository = operadorRepository;
    }

    // GET: Obtener todos los operadores (o solo los activos)
    @GetMapping
    public ResponseEntity<List<Operador>> obtenerTodos() {
        List<Operador> operadores = operadorRepository.findAll();
        return ResponseEntity.ok(operadores);
    }

    // GET: Obtener un operador por ID
    @GetMapping("/{id}")
    public ResponseEntity<Operador> obtenerPorId(@PathVariable Long id) {
        return operadorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST: Crear un nuevo operador
    @PostMapping
    public ResponseEntity<Operador> crearOperador(@RequestBody Operador operador) {
        Operador nuevoOperador = operadorRepository.save(operador);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoOperador);
    }
}
