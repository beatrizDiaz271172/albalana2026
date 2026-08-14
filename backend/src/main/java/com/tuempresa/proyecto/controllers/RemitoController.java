package com.tuempresa.proyecto.controllers;

import com.tuempresa.proyecto.dtos.RemitoRequest;
import com.tuempresa.proyecto.models.Remito;
import com.tuempresa.proyecto.services.RemitoService;
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

    // POST: Crear un nuevo remito (con sus items/lineas de egreso)
    @PostMapping
    public ResponseEntity<Remito> crearRemito(@RequestBody RemitoRequest request) {
        Remito nuevoRemito = remitoService.guardarRemito(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoRemito);
    }
}
