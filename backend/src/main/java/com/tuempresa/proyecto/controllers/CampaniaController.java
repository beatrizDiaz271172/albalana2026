package com.tuempresa.proyecto.controllers;

import java.time.LocalDate;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.tuempresa.proyecto.dtos.CampaniaRequest;
import com.tuempresa.proyecto.models.Campania;
import com.tuempresa.proyecto.services.CampaniaService;
import com.tuempresa.proyecto.services.ExcelService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

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
            CampaniaService.cerrarCampania(request);

            return ResponseEntity.ok(Map.of(
                "mensaje", "✅ Campania cerrada exitosamente",
                "idCampania", request.getId()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "❌ Error: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/campania/descargarExcelCampania")
    public ResponseEntity<?> mostrarExcel(@RequestBody CampaniaRequest request) {
        Long id =request.getId();
        byte[] datos = excelService.descargarExcelLocal(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        String nombreArchivo = "Campania_" + request.getNombre() + ".xlsx";
        
        headers.setContentDispositionFormData("attachment", nombreArchivo);

        return new ResponseEntity<>(datos, headers, HttpStatus.OK);
      }

}