package com.tuempresa.proyecto.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tuempresa.proyecto.dtos.LoteImportDTO;
import com.tuempresa.proyecto.dtos.MovimientoDTO;
import com.tuempresa.proyecto.models.Camara;
import com.tuempresa.proyecto.models.Lote;
import com.tuempresa.proyecto.models.Movimiento;
import com.tuempresa.proyecto.models.Producto;
import com.tuempresa.proyecto.models.Stock;
import com.tuempresa.proyecto.repositories.CamaraRepository;
import com.tuempresa.proyecto.repositories.LoteRepository;
import com.tuempresa.proyecto.repositories.MovimientoRepository;
import com.tuempresa.proyecto.repositories.ProductoRepository;
import com.tuempresa.proyecto.repositories.RemitoRepository;
import com.tuempresa.proyecto.repositories.StockRepository;

import lombok.RequiredArgsConstructor;

@Service
public class ImportacionService {

    private final CamaraRepository camaraRepository;
    private final ProductoRepository productoRepository;
    private final LoteRepository loteRepository;
    private final StockRepository stockRepository;


   public ImportacionService(CamaraRepository camaraRepository, ProductoRepository productoRepository,
    LoteRepository loteRepository, StockRepository stockRepository){
        this.camaraRepository = camaraRepository;
        this.productoRepository = productoRepository;
        this.loteRepository = loteRepository;
        this.stockRepository = stockRepository;
    }

    @Transactional
    public void importarStock(Map<String, Map<String, LoteImportDTO>> json, LocalDate fechaElaboracion) {
        int indice =0;
        for (Map.Entry<String, Map<String, LoteImportDTO>> pe : json.entrySet()) {

            Producto producto = productoRepository.findByNombre(pe.getKey());
            if (producto== null)
                producto = productoRepository.save(new Producto(pe.getKey()));

            for (Map.Entry<String, LoteImportDTO> ce : pe.getValue().entrySet()) {
                indice = indice + 1;
                String nombreCamara = ce.getKey();
                LoteImportDTO dto = ce.getValue();

                Camara camara = camaraRepository.findByNombre(nombreCamara);
                if (camara == null)
                    camara = camaraRepository.save(new Camara(nombreCamara));

                double hormas = dto.hormas() == null ? 0 : dto.hormas();
                double kgs    = dto.kgs()    == null ? 0 : dto.kgs();

                Lote lote = new Lote();
                lote.setProducto(producto);
                lote.setCamara(camara);
                lote.setFechaElaboracion(fechaElaboracion);//TODO como lo engancho con el movimiento
                lote.setActivo(true);
                lote.setHormas(hormas);
                lote.setKgs(kgs);
                lote.setKgsXHorma(hormas > 0 ? kgs / hormas : 0.0);
                lote.setCodigo("LOTE" + indice);
                lote = loteRepository.save(lote);

                Stock stock = new Stock();
                stock.setLote(lote);
                stock.setHormas(hormas);
                stock.setKgs(kgs);
                stock.setFechaAlta(LocalDateTime.now());
                stock.setActivo(true);
                stockRepository.save(stock);
            }
        }
    }

    @Transactional
    public void importarMovimientos( List<MovimientoDTO> json) {
        int indice =0;
        for (MovimientoDTO m : json) {
                indice = indice + 1;
                String nombreProducto = m.getProducto();
                Producto producto = productoRepository.findByNombre(nombreProducto);
            if (producto== null)
                producto = productoRepository.save(new Producto(nombreProducto));

                String nombreCamara = m.getCamara();
                Camara camara = camaraRepository.findByNombre(nombreCamara);
                if (camara == null)
                    camara = camaraRepository.save(new Camara(nombreCamara));

                double hormas = m.getHormas();
                double kgs    = m.getKgs();

                List<Lote> lotes = loteRepository.findByProducto_IdAndCamara_IdAndActivoTrue(producto.getId(), camara.getId());
                 Lote lote = new Lote();
                if (lotes.size() > 0) 
                    lote = lotes.get(0);
                else {
                lote.setProducto(producto);
                lote.setCamara(camara);
                lote.setFechaElaboracion(m.getFecha());//TODO como lo engancho con el movimiento
                lote.setActivo(true);
                lote.setHormas(hormas);
                lote.setKgs(kgs);
                lote.setKgsXHorma(hormas > 0 ? kgs / hormas : 0.0);
                lote.setCodigo("LOTE" + indice);
                lote = loteRepository.save(lote);
                }
/*
                Movimiento mov = new Movimiento();
                String tipoM = 
                mov.setCdTipoMov
                mov.setLote(lote);
                stock.setHormas(hormas);
                stock.setKgs(kgs);
                stock.setFechaAlta(m);
                stock.setActivo(true);
                stockRepository.save(stock);*/
            }
        }
    }
