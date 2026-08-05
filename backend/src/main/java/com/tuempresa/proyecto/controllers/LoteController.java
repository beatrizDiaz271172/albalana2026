package com.tuempresa.proyecto.controllers;

import com.tuempresa.proyecto.models.Lote;
import com.tuempresa.proyecto.repositories.LoteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lotes")

public class LoteController {

    private final LoteRepository loteRepository;

    // Inyección de dependencias por constructor
    public LoteController(LoteRepository loteRepository) {
        this.loteRepository = loteRepository;
    }

    // GET: Obtener todos los lotes
    @GetMapping
    public ResponseEntity<List<Lote>> obtenerTodos() {
        List<Lote> lotes = loteRepository.findAll();
        return ResponseEntity.ok(lotes);
    }

    // GET: Obtener un lote por ID
    @GetMapping("/{id}")
    public ResponseEntity<Lote> obtenerPorId(@PathVariable Long id) {
        return loteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST: Crear un nuevo lote
    @PostMapping
    public ResponseEntity<Lote> crearLote(@RequestBody Lote lote) {
        Lote nuevoLote = loteRepository.save(lote);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoLote);
    }
}