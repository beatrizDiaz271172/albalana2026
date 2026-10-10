package com.tuempresa.proyecto.services;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.File; 

import com.tuempresa.proyecto.models.*;
import com.tuempresa.proyecto.repositories.*;

@Service
public class ExcelService {
    private static final String CARPETA_DESCARGAS = "C:\\Descargas\\Excels";
    @Autowired
    private MovimientoRepository movimientoRepository;
    @Autowired
    private StockService stockService;
    @Autowired
    private CampaniaRepository campaniaRepository;
    @Autowired
    private OperadorRepository operadorRepository;
/* 
    public ByteArrayInputStream generarExcelCierreCampania(Long id) {     
        Campania Campania = CampaniaRepository.findById(id).orElse(null);
        List<Movimiento> movimientos = movimientoRepository.findByArchivadoId(id);

        try (Workbook workbook = new XSSFWorkbook(); 
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            // ✅ HOJA 1: Movimientos
            String nombreHoja1 = Campania != null ? "Campania - " + Campania.getNombre() : "Movimientos";
            Sheet sheet1 = workbook.createSheet(nombreHoja1);
            crearHojaMovimientos(sheet1, movimientos);

            // ✅ HOJA 2: Resumen o datos adicionales
            Sheet sheet2 = workbook.createSheet("Resumen");
            crearHojaResumen(sheet2, Campania, movimientos);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Error al importar los datos a Excel: " + e.getMessage());
        }
    }*/

    // ✅ Método para crear la hoja de Movimientos
    private void crearHojaMovimientos(Sheet sheet, List<Movimiento> movimientos) {
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Lote");
        headerRow.createCell(1).setCellValue("Fecha");
        headerRow.createCell(2).setCellValue("Fecha Elaboracion");
        headerRow.createCell(3).setCellValue("Tipo");
        headerRow.createCell(4).setCellValue("Producto");
        headerRow.createCell(5).setCellValue("Cámara");
        headerRow.createCell(6).setCellValue("Hormas");
        headerRow.createCell(7).setCellValue("Kgs");
        headerRow.createCell(8).setCellValue("Cliente");
        headerRow.createCell(9).setCellValue("Operador");
        headerRow.createCell(10).setCellValue("Observaciones");

        int rowIdx = 1;
        DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        
        for (Movimiento mov : movimientos) {
            Row row = sheet.createRow(rowIdx++);
        
            row.createCell(0).setCellValue(mov.getLote() != null && mov.getLote().getCodigo() != null ? mov.getLote().getCodigo() : "-");
            row.createCell(1).setCellValue(mov.getFechaAlta() != null ? mov.getFechaAlta().format(formato) : "-");
            row.createCell(2).setCellValue(mov.getLote() != null && mov.getLote().getFechaElaboracion() != null ? mov.getLote().getFechaElaboracion().format(formato) : "-");
            row.createCell(3).setCellValue(mov.getCdTipoMov() != null ? obtenerTipoMov(mov.getCdTipoMov().intValue()) : "-");
            row.createCell(4).setCellValue(mov.getLote() != null && mov.getLote().getProducto() != null ? mov.getLote().getProducto().getNombre() : "-");
            row.createCell(5).setCellValue(mov.getLote() != null && mov.getLote().getCamara() != null ? mov.getLote().getCamara().getNombre() : "-");
            row.createCell(6).setCellValue( mov.getHormas() != null ? mov.getHormas() : 0);
            row.createCell(7).setCellValue(mov.getKgs() != null ? mov.getKgs() : 0.0);
            
            String clienteNombre = "-";
            if (mov.getRemito() != null && mov.getRemito().getCliente() != null) {
                clienteNombre = mov.getRemito().getCliente().getNombre();
            } 
            row.createCell(8).setCellValue(clienteNombre);

            String operadorNombre = "-";
            if (mov.getCdOperador() != null) {
                operadorNombre = obtenerOperador(mov.getCdOperador());
            }
            row.createCell(9).setCellValue(operadorNombre);

            row.createCell(10).setCellValue(mov.getObs() != null ? mov.getObs() : "-");
        }
    }

    // ✅ Método para crear la hoja de Resumen de Stock
    private void crearHojaStockResumen(Sheet sheet, Map<String, StockResumen> stocks) {
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Producto");
        headerRow.createCell(1).setCellValue("Hormas");
        headerRow.createCell(2).setCellValue("Kgs");
        int rowIdx = 1;
        for (Map.Entry<String, StockResumen> entry : stocks.entrySet()) {
            Row row = sheet.createRow(rowIdx++);
            String productoNombre = entry.getKey();
            StockResumen stockResumen = entry.getValue();
            
            row.createCell(0).setCellValue(productoNombre);
            row.createCell(1).setCellValue(stockResumen.getHormas());
            row.createCell(2).setCellValue(stockResumen.getKgs());
        }
    }

    private String obtenerTipoMov(int mov) {
        switch (mov) {
            case 1: return "INGRESO";
            case 2: return "EGRESO";
            case 3: return "AJUSTE";
            case 4: return "TRANSFERENCIA";
            default: return "-";
        }
    }

    private String obtenerOperador(Long id) {
        Optional<Operador> op = operadorRepository.findByIdAndActivoTrue(id);
        return op.map(Operador::getNombre).orElse("-");
    }

    public byte[] descargarExcelLocal(Long idCampania) {
        Campania campania = campaniaRepository.findById(idCampania).orElse(null);
        List<Movimiento> movimientos = movimientoRepository.findByArchivadoId(idCampania);
         ByteArrayOutputStream out = null;
    try {
            Workbook workbook = new XSSFWorkbook(); 
            out = new ByteArrayOutputStream(); 
            
            Sheet sheet1 = workbook.createSheet("Stock");
            Map<String, StockResumen> stockResumenMap = stockService.obtenerResumenStock(campania.getId());
            crearHojaStockResumen(sheet1, stockResumenMap);
            
            String nombreHoja2 = campania != null ? "Campania - " + campania.getNombre() : "Movimientos";
            if (nombreHoja2.length() > 31) {
                nombreHoja2 = nombreHoja2.substring(0, 31);
            }
            Sheet sheet2 = workbook.createSheet(nombreHoja2);
            crearHojaMovimientos(sheet2, movimientos);   
            
            workbook.write(out);
    } catch (Exception e) {
            throw new RuntimeException("Error al generar el archivo Excel para la campaña " + idCampania, e);
    }
       /*  if (local){
            // 1. Crear carpeta si no existe
            File carpeta = new File(CARPETA_DESCARGAS);
            if (!carpeta.exists()) {
                carpeta.mkdirs();
            }

            // 2. Generar nombre del archivo
            String nombreArchivo = "Cierre_Campania_" + idCampania + "_" + LocalDate.now() + ".xlsx";
            String rutaCompleta = CARPETA_DESCARGAS + File.separator + nombreArchivo;

            // 3. Guardar archivo en disco
            try (FileOutputStream fos = new FileOutputStream(new File(rutaCompleta))) {
                fos.write(out.toByteArray());
            }

            System.out.println("✅ Excel guardado en: " + rutaCompleta);
            return rutaCompleta;
        */
        return out.toByteArray();
    }
}