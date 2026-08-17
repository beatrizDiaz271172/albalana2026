package com.tuempresa.proyecto.controllers;

import com.tuempresa.proyecto.models.Lote;
import com.tuempresa.proyecto.models.Stock;
import com.tuempresa.proyecto.repositories.LoteRepository;
import com.tuempresa.proyecto.repositories.StockRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lotes")
public class LoteController {

    private final LoteRepository loteRepository;
    private final  StockRepository stockRepository;

    public LoteController(LoteRepository loteRepository, StockRepository stockRepository) {
        this.loteRepository = loteRepository;
        this.stockRepository = stockRepository;
    }

    @GetMapping
    public ResponseEntity<List<Lote>> obtenerTodos() {
        List<Lote> lotes = loteRepository.findAll();
        return ResponseEntity.ok(lotes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lote> obtenerPorId(@PathVariable Long id) {
        return loteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Lote> crearLote(@RequestBody Lote lote) {
        Lote nuevoLote = loteRepository.save(lote);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoLote);
    }

    // Corregido: Consulta directa al repositorio y retorno de la lista filtrada
    @GetMapping("/{idProducto}/{idCamara}")
    public ResponseEntity<List<Lote>> obtenerPorProductoYCamara(@PathVariable Long idProducto, @PathVariable Long idCamara) {
        List<Lote> lotesFiltrados = loteRepository.findByProducto_IdAndCamara_Id(idProducto, idCamara);
        lotesFiltrados.forEach(lote -> {
            Stock stock = stockRepository.findByLote_IdAndActivoTrue(lote.getId());
            if (stock != null){
                lote.setHormas(stock.getHormas());
                lote.setKgs(stock.getKgs());
            }
        });
        
        return ResponseEntity.ok(lotesFiltrados);
    }
}