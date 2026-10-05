package com.tuempresa.proyecto.services;


import com.tuempresa.proyecto.dtos.CamaraRequest;
import com.tuempresa.proyecto.dtos.CampaniaRequest;
import com.tuempresa.proyecto.dtos.MovimientoRequest;
import com.tuempresa.proyecto.dtos.ProductoRequest;
import com.tuempresa.proyecto.models.*;
import com.tuempresa.proyecto.repositories.*;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;

@Service
public class StockService {


    private final StockRepository stockRepository;
    private final MovimientoService movimientoService;
    private final ProductoRepository productoRepository;
    private static final long TIPO_MOV_AJUSTE = 3L;

    public StockService(StockRepository stockRepository, MovimientoService movimientoService, ProductoRepository productoRepository) {
    
        this.stockRepository = stockRepository;     
        this.movimientoService = movimientoService;
        this.productoRepository = productoRepository;
    }

    public List<Stock> obtenerTodos() {
        List<Stock> stocks= stockRepository.findByActivoTrue();
        return stocks;
    }

    public Stock cerrarStock(Stock stock, Long CampaniaId, String descCampania, boolean desdeCero) {
        stock.setActivo(false);
        stock.setArchivadoId(CampaniaId);
        stockRepository.save(stock);
    if (! desdeCero){
        //Mantener el stock, crear mov de ajuste con valores del stock
        MovimientoRequest mov = new MovimientoRequest();
        mov.setCdTipoMov(TIPO_MOV_AJUSTE);
        mov.setCdProducto(stock.getLote().getProducto().getId());    
        mov.setCdLote(stock.getLote().getCodigo());        
        mov.setCdCamara(stock.getLote().getCamara().getId());
        mov.setHormas(stock.getHormas());
        mov.setKgs(stock.getKgs());        
        mov.setObs("Stock Inicial: " + descCampania );
        mov.setCdOperador(0L);

        movimientoService.guardarMovimiento(mov);
    }

    return stock;
    }

    public  Map<String, StockResumen> obtenerResumenStock(Long idCampania) {
        List<Producto> productos = productoRepository.findAll();
        Map<String, StockResumen> stockResumenList = new HashMap<>();

    for (Producto producto : productos) {
      List<Stock> stockList = stockRepository.findByLote_Producto_IdAndArchivadoId(producto.getId(), idCampania);
      if (stockList.size() > 0){
        Double hormaStock = 0.00;
        Double kgsStock = 0.00;
        if (stockList.size() > 0){
            for (Stock stock : stockList) {
                hormaStock =+ stock.getHormas();
                kgsStock =+ stock.getKgs();
            } 
            StockResumen stockR = new StockResumen();
            stockR.setProducto(producto);
            stockR.setHormas(hormaStock);
            stockR.setKgs(kgsStock);
            stockResumenList.put(producto.getNombre(), stockR)   ;
        } 
        }
        }
        return stockResumenList;
      }
}