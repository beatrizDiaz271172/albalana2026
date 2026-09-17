package com.tuempresa.proyecto.services;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.File; 
import java.util.Map; 

import com.tuempresa.proyecto.models.*;
import com.tuempresa.proyecto.repositories.*;

@Service
public class ExcelService {
    private static final String CARPETA_DESCARGAS = "C:\\Descargas\\Excels";
    @Autowired
    private MovimientoRepository movimientoRepository;
    @Autowired
    private StockRepository stockRepository;
    @Autowired
    private CampañaRepository campañaRepository;
    @Autowired
    private ProductoRepository productoRepository;
    @Autowired
    private RemitoRepository remitoRepository;
    @Autowired
    private OperadorRepository operadorRepository;

    public ByteArrayInputStream generarExcelCierreCampaña(Long id) {     
        Campaña campaña = campañaRepository.findById(id).orElse(null);
        List<Movimiento> movimientos = movimientoRepository.findByArchivadoIdAndActivoTrue(id);

        try (Workbook workbook = new XSSFWorkbook(); 
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            // ✅ HOJA 1: Movimientos
            String nombreHoja1 = campaña != null ? "Campaña - " + campaña.getNombre() : "Movimientos";
            Sheet sheet1 = workbook.createSheet(nombreHoja1);
            crearHojaMovimientos(sheet1, movimientos);

            // ✅ HOJA 2: Resumen o datos adicionales
            Sheet sheet2 = workbook.createSheet("Resumen");
            crearHojaResumen(sheet2, campaña, movimientos);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Error al importar los datos a Excel: " + e.getMessage());
        }
    }

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
            row.createCell(6).setCellValue(mov.getLote() != null ? mov.getLote().getHormas() : 0);
            row.createCell(7).setCellValue(mov.getLote() != null ? mov.getLote().getKgs() : 0.0);
            
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

    // ✅ Método para crear la hoja de Resumen
    private void crearHojaResumen(Sheet sheet, Campaña campaña, List<Movimiento> movimientos) {
        // Título
        Row titleRow = sheet.createRow(0);
        titleRow.createCell(0).setCellValue("RESUMEN DE CAMPAÑA");

        // Datos de la campaña
        Row row2 = sheet.createRow(2);
        row2.createCell(0).setCellValue("Campaña:");
        row2.createCell(1).setCellValue(campaña != null ? campaña.getNombre() : "-");

        Row row3 = sheet.createRow(3);
        row3.createCell(0).setCellValue("Total Movimientos:");
        row3.createCell(1).setCellValue(movimientos.size());

        // Totales por tipo
        long ingresos = movimientos.stream().filter(m -> m.getCdTipoMov() != null && m.getCdTipoMov() == 1).count();
        long egresos = movimientos.stream().filter(m -> m.getCdTipoMov() != null && m.getCdTipoMov() == 2).count();
        long ajustes = movimientos.stream().filter(m -> m.getCdTipoMov() != null && m.getCdTipoMov() == 3).count();
        long transferencias = movimientos.stream().filter(m -> m.getCdTipoMov() != null && m.getCdTipoMov() == 4).count();

        Row row4 = sheet.createRow(5);
        row4.createCell(0).setCellValue("Ingresos:");
        row4.createCell(1).setCellValue(ingresos);

        Row row5 = sheet.createRow(6);
        row5.createCell(0).setCellValue("Egresos:");
        row5.createCell(1).setCellValue(egresos);

        Row row6 = sheet.createRow(7);
        row6.createCell(0).setCellValue("Ajustes:");
        row6.createCell(1).setCellValue(ajustes);

        Row row7 = sheet.createRow(8);
        row6.createCell(0).setCellValue("Transferencias:");
        row6.createCell(1).setCellValue(transferencias);

        // Total Kgs
        double totalKgs = movimientos.stream()
            .mapToDouble(m -> m.getLote() != null ? m.getLote().getKgs() : 0.0)
            .sum();

        Row row8 = sheet.createRow(9);
        row8.createCell(0).setCellValue("Total Kgs:");
        row8.createCell(1).setCellValue(totalKgs);
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
    public String guardarExcelEnDisco(Long idCampaña) {
        Campaña campaña = campañaRepository.findById(idCampaña).orElse(null);
        List<Movimiento> movimientos = movimientoRepository.findByArchivadoIdAndActivoTrue(idCampaña);

        try (Workbook workbook = new XSSFWorkbook(); 
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            String nombreHoja1 = campaña != null ? "Campaña - " + campaña.getNombre() : "Movimientos";
            Sheet sheet1 = workbook.createSheet(nombreHoja1);
            crearHojaMovimientos(sheet1, movimientos);

            Sheet sheet2 = workbook.createSheet("Resumen");
            crearHojaResumen(sheet2, campaña, movimientos);

            workbook.write(out);

            // 1. Crear carpeta si no existe
            File carpeta = new File(CARPETA_DESCARGAS);
            if (!carpeta.exists()) {
                carpeta.mkdirs();
            }

            // 2. Generar nombre del archivo
            String nombreArchivo = "Cierre_Campaña_" + idCampaña + "_" + LocalDate.now() + ".xlsx";
            String rutaCompleta = CARPETA_DESCARGAS + File.separator + nombreArchivo;

            // 3. Guardar archivo en disco
            try (FileOutputStream fos = new FileOutputStream(new File(rutaCompleta))) {
                fos.write(out.toByteArray());
            }

            System.out.println("✅ Excel guardado en: " + rutaCompleta);
            return rutaCompleta;

        } catch (IOException e) {
            throw new RuntimeException("Error al guardar Excel en disco: " + e.getMessage());
        }
    }
}