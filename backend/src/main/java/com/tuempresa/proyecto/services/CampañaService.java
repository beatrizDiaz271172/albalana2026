package com.tuempresa.proyecto.services;


import com.tuempresa.proyecto.dtos.CamaraRequest;
import com.tuempresa.proyecto.dtos.CampañaRequest;
import com.tuempresa.proyecto.dtos.ProductoRequest;
import com.tuempresa.proyecto.models.*;
import com.tuempresa.proyecto.repositories.*;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;

@Service
public class CampañaService {

    private final CampañaRepository campañaRepository;
    private final StockService stockService;
    private final MovimientoService movimientoService;

    public CampañaService(CampañaRepository campañaRepository, StockService stockService, MovimientoService movimientoService) {
        this.campañaRepository = campañaRepository;
        this.stockService = stockService;     
        this.movimientoService = movimientoService;  
    }

    public List<Campaña> obtenerTodas() {
       return campañaRepository.findAll();
    }

     public Campaña guardarCampaña(CampañaRequest request) {
        Campaña camara = new Campaña(request.getNombre(), request.getFechaInicio(), request.getFechaFin(),
                         request.getCantMov(), request.getCantHormas(), request.getCantKilos());
        return campañaRepository.save(camara);
    }

    public Campaña cerrarCampaña(CampañaRequest request) {
        boolean desdeCero = request.isDesdeCero();
        Long campañaId = request.getId();
        if (desdeCero){
            campañaId = 0L;
        }

        List<Movimiento> movimientosActivos = movimientoService.obtenerTodos();
        Long ctMov =0L;
        for (Movimiento movimiento : movimientosActivos) {
            movimientoService.cerrarMovimiento(movimiento, campañaId);
            ctMov += 1;
        }

        List<Stock> stockActivos = stockService.obtenerTodos();
        Double hormasTot = 0.00;
        Double kgsTot = 0.00;
        for (Stock stock : stockActivos) {
            hormasTot += stock.getHormas();
            kgsTot += stock.getKgs();
            stockService.cerrarStock(stock, campañaId, request.getNombre(), desdeCero);         
        }

        //Movimientos, poner en ArchivadosId el id de Campaña y en activo=false
        //Stock, poner en ArchivadosId el id de Campaña + en activo=false y por cada registro crear un Movimiento de tipo Ajuste    
        //Campaña, actualizarla con fecha fin y cantidades
        //Generar Excel con toda la info y luego mandar a Zip para descargar
        
   
    Campaña campaña = campañaRepository.findById(campañaId)
        .orElseThrow(() -> new RuntimeException("Campaña no encontrada con ID: " +request.getId()));
    
    campaña.setFechaFin(LocalDate.now());
    campaña.setNombre(request.getNombre());
    //FALTAN ESTOS TOTALES
    campaña.setCantMov(ctMov);
    campaña.setCantHormas(hormasTot);
    campaña.setCantKilos(kgsTot);
    campaña.setActivo(false);
    campañaRepository.save(campaña);
    Campaña nuevaCampaña = new Campaña("", LocalDate.now(), LocalDate.now(), 0L, 0.00, 0.00);
    return campañaRepository.save(nuevaCampaña);
    
}

}