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

    @PostMapping
    public ResponseEntity<Void> importarStock(
            @RequestBody Map<String, Map<String, LoteImportDTO>> json) {
              
        service.importarStock(json);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/movimientos")
    public ResponseEntity<Void> importarMovimientos(@RequestBody List<MovimientoDTO> movimientos) {
        service.importarConfig();  
        service.importarMovimientos(movimientos);

        return ResponseEntity.ok().build();
    }
}
/*

  
  {
    "id": "MOV-0001",
    "tipo": "INGRESO",
    "timestamp": "2026-05-26T14:10:43.661119",
    "fecha": "26/05/2026",
    "producto": "Peco. Reserva",
    "lote": "PR01",
    "camara": "Camara 1",
    "hormas": 10,
    "kgs": 30.0,
    "lts_leche": 0.0,
    "fermento": "",
    "obs": "",
    "operador": "Loro",
    "cliente": "",
    "motivo": "",
    "timestamp_editado": "2026-05-29T13:36:02.737938"

*/