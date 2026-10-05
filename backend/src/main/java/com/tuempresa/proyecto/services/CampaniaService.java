package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.dtos.CampaniaRequest;
import com.tuempresa.proyecto.models.*;
import com.tuempresa.proyecto.repositories.*;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;

@Service
public class CampaniaService {

    private final CampaniaRepository CampaniaRepository;
    private final StockService stockService;
    private final MovimientoService movimientoService;

    public CampaniaService(CampaniaRepository CampaniaRepository, StockService stockService, MovimientoService movimientoService) {
        this.CampaniaRepository = CampaniaRepository;
        this.stockService = stockService;     
        this.movimientoService = movimientoService;  
    }

    public List<Campania> obtenerTodas() {
       return CampaniaRepository.findAll();
    }

     public Campania guardarCampania(CampaniaRequest request) {
        Campania camara = new Campania(request.getNombre(), request.getFechaInicio(), request.getFechaFin(),
                         request.getCantMov(), request.getCantHormas(), request.getCantKilos());
        return CampaniaRepository.save(camara);
    }

    public Campania cerrarCampania(CampaniaRequest request) {
        boolean desdeCero = request.isDesdeCero();
        Long CampaniaId = request.getId();

        List<Movimiento> movimientosActivos = movimientoService.obtenerTodos();
        Long ctMov =0L;
        for (Movimiento movimiento : movimientosActivos) {
            movimientoService.cerrarMovimiento(movimiento, CampaniaId);
            ctMov += 1;
        }

        List<Stock> stockActivos = stockService.obtenerTodos();
        Double hormasTot = 0.00;
        Double kgsTot = 0.00;
        for (Stock stock : stockActivos) {
            hormasTot += stock.getHormas();
            kgsTot += stock.getKgs();
            stockService.cerrarStock(stock, CampaniaId, request.getNombre(), desdeCero);         
        }

        //Movimientos, poner en ArchivadosId el id de Campania y en activo=false
        //Stock, poner en ArchivadosId el id de Campania + en activo=false y por cada registro crear un Movimiento de tipo Ajuste    
        //Campania, actualizarla con fecha fin y cantidades
        //Generar Excel con toda la info y luego mandar a Zip para descargar
       
       
   
    Campania campania = CampaniaRepository.findByIdAndActivoTrue(CampaniaId);
    if (campania == null){
        campania = new Campania();
        campania.setFechaInicio(LocalDate.now());
    }
    
    campania.setFechaFin(LocalDate.now());
    campania.setNombre(request.getNombre());
    //FALTAN ESTOS TOTALES
    campania.setCantMov(ctMov);
    campania.setCantHormas(hormasTot);
    campania.setCantKilos(kgsTot);
    campania.setActivo(false);
    CampaniaRepository.save(campania);
    Campania nuevaCampania = new Campania("", LocalDate.now(), null, 0L, 0.00, 0.00);
    return CampaniaRepository.save(nuevaCampania);    
}


}