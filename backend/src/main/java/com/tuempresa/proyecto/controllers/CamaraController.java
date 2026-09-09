package com.tuempresa.proyecto.controllers;

import java.util.List; // 👈 Importación que faltaba

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.tuempresa.proyecto.dtos.CamaraRequest;
import com.tuempresa.proyecto.models.Camara;
import com.tuempresa.proyecto.repositories.CamaraRepository;
import com.tuempresa.proyecto.services.CamaraService;

@RestController
@RequestMapping("/api/camaras")

public class CamaraController {

    private final CamaraRepository camaraRepository;
    private final CamaraService camaraService;

    public CamaraController(CamaraRepository camaraRepository, CamaraService camaraService) {
        this.camaraRepository = camaraRepository;
        this.camaraService = camaraService;
    }

    @GetMapping
    public ResponseEntity<List<Camara>> obtenerTodas() {
        List<Camara> camaras = camaraRepository.findByActivoTrue();
        return ResponseEntity.ok(camaras);
    }

    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<List<Camara>> obtenerPorProductoId(@PathVariable Long idProducto) {
        List<Camara> camaras = camaraService.obtenerPorProductoId(idProducto);
        return ResponseEntity.ok(camaras);   
    }

    /*@PostMapping
    public ResponseEntity<Camara> crearCamra(@RequestBody CamaraRequest request) {
        Camara nuevaCamara = camaraService.guardarCamara(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCamara);
    }*/ 

    
    @PostMapping
    public ResponseEntity<Camara> crearCamara(@RequestBody Camara camara) {
         Camara nuevaCamara = camaraRepository.save(camara);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCamara);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Camara> updateCamara(@PathVariable Long id, @RequestBody CamaraRequest request) {
    Camara camaraActualizada = camaraService.actualizarCamara(id, request);
    return ResponseEntity.ok(camaraActualizada);
    }
}

    
