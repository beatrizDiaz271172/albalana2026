package com.tuempresa.proyecto.controllers;

import com.tuempresa.proyecto.dtos.RemitoRequest;
import com.tuempresa.proyecto.exceptions.ReferenciaExistenteException;
import com.tuempresa.proyecto.models.Movimiento;
import com.tuempresa.proyecto.models.Remito;
import com.tuempresa.proyecto.services.RemitoService;

import jakarta.persistence.EntityNotFoundException;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/remitos")
public class RemitoController {

    private final RemitoService remitoService;

    public RemitoController(RemitoService remitoService) {
        this.remitoService = remitoService;
    }

    // GET: Listar todos los remitos
    @GetMapping
    public ResponseEntity<List<Remito>> listarRemitos() {
        return ResponseEntity.ok(remitoService.obtenerTodos());
    }

    @GetMapping("/{remitoId}")
    public ResponseEntity<Remito> buscarRemito(@PathVariable Long remitoId) {
        return ResponseEntity.ok(remitoService.obtenerEncabezadoRemito(remitoId));
    }

    @GetMapping("/{remitoId}/items")
    public ResponseEntity<List<Movimiento>> listarItemsRemitos(@PathVariable Long remitoId) {
        return ResponseEntity.ok(remitoService.obtenerItemsRemito(remitoId));
    }

    // POST: Crear un nuevo remito (con sus items/lineas de egreso)
    @PostMapping
    public ResponseEntity<Remito> crearRemito(@RequestBody RemitoRequest request) {
        Remito nuevoRemito = remitoService.guardarRemito(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoRemito);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarRemito(@PathVariable Long id) {
        try {
            remitoService.eliminarRemito(id);
            return ResponseEntity.noContent().build(); // Retorna 204 No Content en éxito
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("mensaje", e.getMessage()));
        } catch (DataIntegrityViolationException | ReferenciaExistenteException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }
}
