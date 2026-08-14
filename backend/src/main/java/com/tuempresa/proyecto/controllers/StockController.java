package com.tuempresa.proyecto.controllers;

import com.tuempresa.proyecto.models.*;
import com.tuempresa.proyecto.repositories.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")

public class StockController {

    private final StockRepository stockRepository;
   // Inyección de dependencias por constructor
    public StockController(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }
 
    // GET: Obtener un lote por ID
    @GetMapping("/{id}")
    public ResponseEntity<Stock> obtenerPorId(@PathVariable Long id) {
        return stockRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

  
}