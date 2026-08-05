package com.tuempresa.proyecto.controllers;

import java.util.List; // 👈 Importación que faltaba

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tuempresa.proyecto.models.Camara;
import com.tuempresa.proyecto.repositories.CamaraRepository;

@RestController
@RequestMapping("/api/camaras")

public class CamaraController {

    private final CamaraRepository camaraRepository;

    public CamaraController(CamaraRepository camaraRepository) {
        this.camaraRepository = camaraRepository;
    }

    @GetMapping
    public ResponseEntity<List<Camara>> obtenerTodas() {
        List<Camara> camaras = camaraRepository.findAll();
        return ResponseEntity.ok(camaras);
    }
}

    
