package com.tuempresa.proyecto.controllers;

import java.io.File;  // ✅ AGREGAR
import java.util.List;
import java.util.Map;  // ✅ AGREGAR
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.tuempresa.proyecto.dtos.CampaniaRequest;
import com.tuempresa.proyecto.models.Campania;
import com.tuempresa.proyecto.services.CampaniaService;
import com.tuempresa.proyecto.services.ExcelService;

@RestController
@RequestMapping("/api")
public class CampaniaController {

    private final CampaniaService CampaniaService;
    private final ExcelService excelService;

    public CampaniaController(CampaniaService CampaniaService, ExcelService excelService) {
        this.CampaniaService = CampaniaService;
        this.excelService = excelService;
    }
   
    @GetMapping("/campanias")
    public ResponseEntity<List<Campania>> obtenerTodos() {
        return ResponseEntity.ok(CampaniaService.obtenerTodas());
    }

    @PostMapping
    public ResponseEntity<Campania> crearCampania(@RequestBody CampaniaRequest Campania) {
        Campania nuevo = CampaniaService.guardarCampania(Campania);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    } 
    
    @PostMapping("/campania/cerrar")
    public ResponseEntity<?> cerrarCampania(@RequestBody CampaniaRequest request) {
        try {
            // 1. Cerrar la Campania
            Campania CampaniaNueva = CampaniaService.cerrarCampania(request);
            
            // 2. Guardar Excel en disco
            String rutaArchivo = excelService.guardarExcelEnDisco(request.getId());

            // 3. Retornar respuesta con la ruta
            return ResponseEntity.ok(Map.of(
                "mensaje", "✅ Campania cerrada exitosamente",
                "idCampania", request.getId(),
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