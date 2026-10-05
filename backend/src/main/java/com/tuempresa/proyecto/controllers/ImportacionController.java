package com.tuempresa.proyecto.controllers;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.tuempresa.proyecto.dtos.*;
import com.tuempresa.proyecto.services.ImportacionService;
import java.util.List;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/importar")
@RequiredArgsConstructor
public class ImportacionController {

    private final ImportacionService service;

    @PostMapping("/stock")
    public ResponseEntity<Void> importarStock(
            @RequestBody Map<String, Map<String, LoteImportDTO>> json,
            @RequestParam(required = false) LocalDate fechaElaboracion) {

        service.importarStock(json, fechaElaboracion != null ? fechaElaboracion : LocalDate.now());
        return ResponseEntity.ok().build();
    }
    @PostMapping("/movimientos")
    public ResponseEntity<Void> importarMovimientos(@RequestBody List<MovimientoDTO> movimientos) {
        service.importarMovimientos(movimientos);
        movimientos.forEach(m -> System.out.println(m.getId() + " " + m.getTipo()));
        return ResponseEntity.ok().build();
    }
}