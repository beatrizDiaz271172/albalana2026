package com.tuempresa.proyecto.controllers;

import java.io.ByteArrayInputStream;
import java.io.File;  // ✅ AGREGAR
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;  // ✅ AGREGAR

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tuempresa.proyecto.dtos.CampañaRequest;
import com.tuempresa.proyecto.models.Campaña;
import com.tuempresa.proyecto.repositories.CampañaRepository;
import com.tuempresa.proyecto.services.CampañaService;
import com.tuempresa.proyecto.services.ExcelService;

@RestController
@RequestMapping("/api")
public class CampañaController {

    private final CampañaService campañaService;
    private final ExcelService excelService;

    public CampañaController(CampañaService campañaService, ExcelService excelService) {
        this.campañaService = campañaService;
        this.excelService = excelService;
    }
   
    @GetMapping("/campanias")
    public ResponseEntity<List<Campaña>> obtenerTodos() {
        return ResponseEntity.ok(campañaService.obtenerTodas());
    }

    @PostMapping
    public ResponseEntity<Campaña> crearCampaña(@RequestBody CampañaRequest campaña) {
        Campaña nuevo = campañaService.guardarCampaña(campaña);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    } 
    
    @PostMapping("/campania/cerrar")
    public ResponseEntity<?> cerrarCampaña(@RequestBody CampañaRequest request) {
        try {
            // 1. Cerrar la campaña
            Campaña campañaNueva = campañaService.cerrarCampaña(request);
            
            // 2. Guardar Excel en disco
            String rutaArchivo = excelService.guardarExcelEnDisco(request.getId());

            // 3. Retornar respuesta con la ruta
            return ResponseEntity.ok(Map.of(
                "mensaje", "✅ Campaña cerrada exitosamente",
                "idCampaña", request.getId(),
                "rutaArchivo", rutaArchivo,
                "nombreArchivo", new File(rutaArchivo).getName()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "❌ Error: " + e.getMessage()
            ));
        }
    }
}