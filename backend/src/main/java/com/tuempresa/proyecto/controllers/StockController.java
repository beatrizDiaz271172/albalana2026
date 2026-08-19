package com.tuempresa.proyecto.controllers;

import com.tuempresa.proyecto.models.Stock;
import com.tuempresa.proyecto.repositories.StockRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@CrossOrigin(origins = "*")
public class StockController {

    private final StockRepository stockRepository;

    public StockController(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    @GetMapping
    public ResponseEntity<List<Stock>> obtenerTodos() {
        return ResponseEntity.ok(stockRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Stock> obtenerPorId(@PathVariable Long id) {
        return stockRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/lote/{loteId}")
    public ResponseEntity<Stock> obtenerPorLoteId(@PathVariable Long loteId) {
        Stock stock = stockRepository.findByLote_IdAndActivoTrue(loteId); 
        if (stock != null) {
            return ResponseEntity.ok(stock);
        }
        return ResponseEntity.notFound().build();
    }

    // NUEVO ENDPOINT: Obtiene todo el stock disponible según idProducto e idCamara
    @GetMapping("/producto/{idProducto}/camara/{idCamara}")
    public ResponseEntity<List<Stock>> obtenerPorProductoYCamara(
            @PathVariable Long idProducto, 
            @PathVariable Long idCamara) {
        
        List<Stock> stockFiltrado = stockRepository.findByLote_Producto_IdAndLote_Camara_IdAndActivoTrue(idProducto, idCamara);
        return ResponseEntity.ok(stockFiltrado);
    }
}