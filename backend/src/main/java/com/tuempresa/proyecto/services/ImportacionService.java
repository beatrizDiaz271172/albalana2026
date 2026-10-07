package com.tuempresa.proyecto.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tuempresa.proyecto.dtos.LoteImportDTO;
import com.tuempresa.proyecto.dtos.MovimientoDTO;
import com.tuempresa.proyecto.models.*;
import com.tuempresa.proyecto.repositories.*;

@Service
public class ImportacionService {

    private final CamaraRepository camaraRepository;
    private final ClienteRepository clienteRepository;
    private final ProductoRepository productoRepository;
    private final LoteRepository loteRepository;
    private final StockRepository stockRepository;
    private final MovimientoRepository movimientoRepository;
    private final OperadorRepository operadorRepository;
    private final RemitoRepository remitoRepository;
    private final CampaniaRepository campaniaRepository;


   public ImportacionService(CamaraRepository camaraRepository, ProductoRepository productoRepository,
    LoteRepository loteRepository, StockRepository stockRepository, MovimientoRepository movimientoRepository,
    OperadorRepository operadorRepository, ClienteRepository clienteRepository, RemitoRepository remitoRepository,
CampaniaRepository campaniaRepository){
        this.camaraRepository = camaraRepository;
        this.clienteRepository = clienteRepository;
        this.productoRepository = productoRepository;
        this.loteRepository = loteRepository;
        this.stockRepository = stockRepository;
        this.movimientoRepository = movimientoRepository;
        this.operadorRepository = operadorRepository;
        this.remitoRepository = remitoRepository;
        this.campaniaRepository = campaniaRepository;
    }

    @Transactional
    public void importarConfig() {
       movimientoRepository.deleteAll();
       stockRepository.deleteAll(); 
       loteRepository.deleteAll();
       remitoRepository.deleteAll();
       productoRepository.deleteAll(); 
       clienteRepository.deleteAll();
       operadorRepository.deleteAll();
       campaniaRepository.deleteAll();

       Producto prod = new Producto("Cacciota", "CAC", 0L, 30L, 3L, 0L, 0L, 0L);
       productoRepository.save(prod);

       prod = new Producto("Caciotta Cuña", "CAC-C", 0L, 30L, 3L, 0L, 0L, 0L);
       productoRepository.save(prod);

       prod = new Producto("Peco. Semi", "PSM", 60L, 90L, 3L, 0L, 0L, 0L);
       productoRepository.save(prod);

       prod = new Producto("Peco. Reserva", "PRE", 90L, 120L, 3L, 0L, 0L, 0L);
       productoRepository.save(prod);

       prod = new Producto("Peco. Medalla", "PME", 180L, 180L, 3L, 0L, 0L, 0L);
       productoRepository.save(prod);

       prod = new Producto("Peco. Reserva Cuña", "PRE-C", 90L, 120L, 3L, 0L, 0L, 0L);
       productoRepository.save(prod);

       prod = new Producto("Peco. Medalla Cuña", "PME-C", 180L, 180L, 3L, 0L, 0L, 0L);
       productoRepository.save(prod);

       prod = new Producto("Manchego horma", "MAN", 60L, 90L, 3L, 0L, 0L, 0L);
       productoRepository.save(prod);      

       prod = new Producto("Manchego cuña", "MAN-C", 60L, 90L, 3L, 0L, 0L, 0L);
       productoRepository.save(prod);      

       prod = new Producto("Bravo horma", "BRA", 30L, 60L, 3L, 0L, 0L, 0L);
       productoRepository.save(prod);      

       prod = new Producto("Bravo Duo Horma", "BRA-D", 30L, 60L, 3L, 0L, 0L, 0L);
       productoRepository.save(prod);   

       prod = new Producto("Bravo Cuña", "BRA-C", 30L, 60L, 3L, 0L, 0L, 0L);
       productoRepository.save(prod);  
       
       prod = new Producto("Bravo Duo Cuña", "BDC", 30L, 60L, 3L, 0L, 0L, 0L);
       productoRepository.save(prod);  
       
       prod = new Producto("Ricota env gr", "RIC-G", 30L, 14L, 3L, 0L, 0L, 0L);
       productoRepository.save(prod);       
       
       prod = new Producto("Ricota env ch", "RIC-C", 30L, 14L, 3L, 0L, 0L, 0L);
       productoRepository.save(prod);   
       
       Campania cam = new Campania();
       cam.setFechaInicio(LocalDate.now());
       cam.setActivo(true);
       campaniaRepository.save(cam);
    }
    
    @Transactional
    public void importarStock(Map<String, Map<String, LoteImportDTO>> json) {
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
            if (hormas > 0 && kgs > 0){
                Lote lote = new Lote();
                List<Lote> lotes = loteRepository.findByProducto_IdAndCamara_IdAndActivoTrue(producto.getId(), camara.getId());
            if (lotes.size() >0){
                lote = lotes.get(0);
/*              lote.setProducto(producto);
                lote.setCamara(camara);
                lote.setFechaElaboracion(LocalDate.now());//TODO como lo engancho con el movimiento
                lote.setActivo(true);
                lote.setHormas(hormas);
                lote.setKgs(kgs);
                lote.setKgsXHorma(hormas > 0 ? kgs / hormas : 0.0);
                lote.setCodigo("LOTE" + indice);
                lote = loteRepository.save(lote);*/

                Stock stock = new Stock();
                stock.setLote(lote);
                stock.setHormas(hormas);
                stock.setKgs(kgs);
                stock.setFechaAlta(LocalDateTime.now());
                stock.setActivo(true);
                stockRepository.save(stock);
                }} else {
                    //json vino mal
                }
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
            if (hormas >0.00 && kgs > 0.00){

                List<Lote> lotes = loteRepository.findByProducto_IdAndCamara_IdAndActivoTrue(producto.getId(), camara.getId());
                Lote lote = null;
                if (lotes.size() > 0){
                    lote = lotes.get(0);
                    if (m.getTipo().equals("INGRESO")){
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                        LocalDate fechaCustom = LocalDate.parse(m.getFecha(), formatter);
                        lote.setFechaElaboracion(fechaCustom);
                        loteRepository.save(lote);
                    }
                }                
                else {
                lote = new Lote();
                lote.setProducto(producto);
                lote.setCamara(camara);
                if (m.getTipo().equals("INGRESO")){
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                    LocalDate fechaCustom = LocalDate.parse(m.getFecha(), formatter);
                    lote.setFechaElaboracion(fechaCustom);
                }
                lote.setActivo(true);
                lote.setHormas(hormas);
                lote.setKgs(kgs);
                lote.setKgsXHorma(hormas > 0 ? kgs / hormas : 0.0);
                lote.setCodigo("LOTE" + indice);
                lote = loteRepository.save(lote);
                }

                Movimiento mov = new Movimiento();
                mov.setLote(lote);
                mov.setHormas(hormas);
                mov.setKgs(kgs);
                LocalDateTime fechaHora = LocalDateTime.parse(m.getTimestamp());
                mov.setFechaAlta(fechaHora);
                mov.setObs(m.getObs());
                mov.setActivo(true);
                
                String tipoM = m.getTipo();
                
                if (tipoM.equals("INGRESO")){
                    mov.setCdTipoMov(1L);
                }else if (tipoM.equals("AJUSTE")){
                    mov.setCdTipoMov(3L);
                }else if (tipoM.equals("TRANSFERENCIA")){
                    mov.setCdTipoMov(4L);
                }else if (tipoM.equals("EGRESO")){
                    mov.setCdTipoMov(2L);
                    String operador= m.getOperador();
                    Operador op = operadorRepository.findByNombreAndActivoTrue(operador);
                    if (op == null){
                        op = new Operador(operador);
                        op = operadorRepository.save(op);
                    }

                    String cliente= m.getCliente();
                    Cliente cli = clienteRepository.findByNombreAndActivoTrue(cliente);
                    if (cli == null){
                        cli = new Cliente(cliente);
                        cli = clienteRepository.save(cli);
                    }
                  //  LocalDate fechaEgreso = m.getFecha();
                    LocalDate fechaElab = lote.getFechaElaboracion();
                    if (fechaElab != null){
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                        fechaElab = LocalDate.parse(m.getFecha(), formatter);
                        LocalDate fechaEgreso = LocalDate.parse(m.getFecha(), formatter);
                        Long diasMaduracionRem = ChronoUnit.DAYS.between(fechaElab, fechaEgreso); 
                        mov.setDiasMaduracionRem(diasMaduracionRem);
                    }
                    
                    String codigoJson = m.getRemito();
                    Remito rem = remitoRepository.findByCodigoJsonAndActivoTrue(codigoJson);
                    if (rem == null){
                        rem = new Remito();
                        rem.setCodigoJson(codigoJson);
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                        LocalDate fechaCustom = LocalDate.parse(m.getFecha(), formatter);
                        rem.setFechaEgreso(fechaCustom);
                        rem.setOperador(op);
                        rem.setCliente(cli);
                        rem.setActivo(true);
                        remitoRepository.save(rem);
                    }
                    mov.setRemito(rem);
                }
                movimientoRepository.save(mov);  
            } else {
              //viene mal de Json  
            }
        }
            
        }
    }
    