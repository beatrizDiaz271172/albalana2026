package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.dtos.ProductoRequest;
import com.tuempresa.proyecto.models.*;
import com.tuempresa.proyecto.repositories.*;
import org.springframework.stereotype.Service;

import java.util.*;


@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final MovimientoRepository movimientoRepository;
    private final StockRepository stockRepository;

    public ProductoService(ProductoRepository productoRepository, MovimientoRepository movimientoRepository, StockRepository stockRepository) {
        this.productoRepository = productoRepository;
        this.movimientoRepository = movimientoRepository;
        this.stockRepository = stockRepository;
        
    }

    public List<Producto> obtenerTodos() {
        List<Producto> productos= productoRepository.findByActivoTrue();
        return productos;
    }

    public Producto crearProducto(ProductoRequest request) {
        Producto producto = new Producto(request.getNombre(), request.getCodigo(), request.getMaduracionDias(),
        request.getConsumoOptDias(), request.getStockMinimo(), request.getDiasSinMov(), request.getPreMaduracionDias(), request.getPostMaduracionDias());
        return productoRepository.save(producto);
    }

    public Producto actualizarProducto(Long id, ProductoRequest request) {
    Producto producto = productoRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + id));
    
    // ✅ Validar que el nombre no esté duplicado (excepto el actual)
    if (!producto.getNombre().equalsIgnoreCase(request.getNombre())) {
        boolean nombreDuplicado = productoRepository.existsByNombreIgnoreCase(request.getNombre());
        if (nombreDuplicado) {
            throw new IllegalArgumentException("El nombre de producto ya existe");
        }
    }
    
    // Actualizar campos
    producto.setNombre(request.getNombre());
    producto.setCodigo(request.getCodigo());
    producto.setMaduracionDias(request.getMaduracionDias());
    producto.setConsumoOptDias(request.getConsumoOptDias());
    producto.setStockMinimo(request.getStockMinimo());
    producto.setPreMaduracionDias(request.getPreMaduracionDias());
    producto.setPostMaduracionDias(request.getPostMaduracionDias());
    producto.setDiasSinMov(request.getDiasSinMov());
    
    return productoRepository.save(producto);
}

    public List<MermasEstadisticas> obtenerProductosConMermasEstadisticas() {
  
    List<Producto> productos = productoRepository.findAll();
    List<MermasEstadisticas> mermasEstad = new ArrayList<>();

    for (Producto producto : productos) {
        
    List<Movimiento> movimientosEgreso = movimientoRepository.findByCdTipoMovAndLote_Producto_idAndActivoTrue(2, producto.getId());
    //Solo se obtienen estadisticas si existen movimientos de egreso para el producto
    if (movimientosEgreso.size()>0) {
      
        
        double kgsXHormaTot = 0.0;
        long kgsXHormaTotCant = 0;
        List<Movimiento> movimientosIngreso = movimientoRepository.findByCdTipoMovAndLote_Producto_idAndActivoTrue(1, producto.getId());
      /*   
        for (Movimiento mov : movimientosIngreso) {// bea
            if (mov.getLote() != null && mov.getLote().getKgsXHorma() != null) {
                kgsXHormaTot += mov.getLote().getKgsXHorma();
                kgsXHormaTotCant += 1;
            }
        }

        //Peso promedio Kgs por Hormas en los Ingresos
        if (kgsXHormaTotCant>0){
            Double cuenta = kgsXHormaTot / kgsXHormaTotCant;
            merma.setPesoKgsXHormaIngreso(cuenta);
        }*/

        double hormaTotCant = 0.0;
        //hashMap
        Map<String, Double> hormaTotE = new HashMap<>();
        Map<String, Double> kgsTotE = new HashMap<>();
        for (Movimiento mov : movimientosEgreso) {
            if (mov.getLote() != null && mov.getHormas() != null) {
                hormaTotE.merge(mov.getLote().getCodigo(), mov.getHormas(), Double::sum);
                kgsTotE.merge(mov.getLote().getCodigo(), mov.getKgs(), Double::sum);
                hormaTotCant += 1;
            }
        }

        List<Stock> stockList = stockRepository.findByLote_Producto_IdAndActivoTrue(producto.getId());
        Map<String, Double> hormaStock = new HashMap<>();
        Map<String, Double> kgsIporHorma = new HashMap<>();
        if (stockList.size() > 0){
            for (Stock stock : stockList) {
                hormaStock.merge(stock.getLote().getCodigo(), stock.getHormas(), Double::sum);
                kgsIporHorma.merge(stock.getLote().getCodigo(), stock.getLote().getKgsXHorma(), Double::sum);
            }    
        } 

        for (Map.Entry<String, Double> entry : hormaTotE.entrySet()) {
            String cdLote = entry.getKey();
            Double hormaE = entry.getValue();
             MermasEstadisticas merma = new MermasEstadisticas();
             merma.setProductoId(producto.getId());
             merma.setProductoNombre(producto.getNombre());
             merma.setCdCodigoLote(cdLote);
             merma.setEgresoHormas(hormaE); 
             Double kgs = kgsTotE.get(cdLote);
             merma.setEgresoKgs(kgs);
             Double kgsXHormaPpio = kgsIporHorma.get(cdLote);   
             merma.setEgresoKgsPpio(hormaE * kgsXHormaPpio);
             merma.setMermaKgs(merma.getEgresoKgsPpio() - merma.getEgresoKgs());    
             double porc = (merma.getMermaKgs() * 100) / merma.getEgresoKgsPpio();
             merma.setMermaKgsPorc(porc);
             merma.setPesoKgsXHormaEgreso(merma.getEgresoKgs() / merma.getEgresoHormas());       
             Double hormaSt = hormaStock.get(cdLote);
             merma.setHormasStock(hormaSt);
             merma.setKgsStockReal(hormaSt * merma.getPesoKgsXHormaEgreso());
             merma.setKgsStockSinMerma(hormaSt * kgsXHormaPpio);
             merma.setMermaStock(merma.getKgsStockSinMerma() - merma.getKgsStockReal());
             merma.setPesoKgsXHormaIngreso(kgsXHormaPpio);
             mermasEstad.add(merma);
        };  
    }
    }
    return mermasEstad;
  }

}