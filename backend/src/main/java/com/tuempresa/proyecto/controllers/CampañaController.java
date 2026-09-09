package com.tuempresa.proyecto.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tuempresa.proyecto.dtos.CampañaRequest;
import com.tuempresa.proyecto.models.Campaña;

import com.tuempresa.proyecto.repositories.CampañaRepository;
import com.tuempresa.proyecto.services.CampañaService;

@RestController
@RequestMapping("/api")
public class CampañaController {

    private final CampañaService campañaService;

    public CampañaController(CampañaService campañaService) {
        this.campañaService = campañaService;
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
    public ResponseEntity<Campaña> cerrarCampaña(@RequestBody CampañaRequest campaña) {
        campañaService.cerrarCampaña(campaña);
        return null;
    
    }
}