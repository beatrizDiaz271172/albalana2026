package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.models.*;
import com.tuempresa.proyecto.repositories.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class ReporteExcelService {

    private final MovimientoRepository movimientoRepository;
    private final StockRepository stockRepository;
    private final ProductoRepository productoRepository;
    private final CamaraRepository camaraRepository;
    private final RemitoRepository remitoRepository;
    private final ClienteRepository clienteRepository;
    private final OperadorRepository operadorRepository;
    private final LoteRepository loteRepository;
    private final MovimientoService movimientoService;
    private final ProductoService productoService;

    public ReporteExcelService(MovimientoRepository movimientoRepository,
                               StockRepository stockRepository,
                               ProductoRepository productoRepository,
                               CamaraRepository camaraRepository,
                               RemitoRepository remitoRepository,
                               ClienteRepository clienteRepository,
                               OperadorRepository operadorRepository,
                               LoteRepository loteRepository,
                               MovimientoService movimientoService,
                               ProductoService productoService) {
        this.movimientoRepository = movimientoRepository;
        this.stockRepository = stockRepository;
        this.productoRepository = productoRepository;
        this.camaraRepository = camaraRepository;
        this.remitoRepository = remitoRepository;
        this.operadorRepository = operadorRepository;
        this.clienteRepository = clienteRepository;
        this.loteRepository = loteRepository;
        this.movimientoService = movimientoService;
        this.productoService = productoService;
    }

    public byte[] generarReporteExcelDinamico(LocalDate fechaDesde) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            // Estilos globales
            CellStyle headerStyle = crearEstiloEncabezado(workbook);
            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setDataFormat(workbook.createDataFormat().getFormat("dd/MM/yyyy"));

            // 1. Stock por producto
            crearHojaStockProducto(workbook.createSheet("Stock por producto"), headerStyle);

            // 2. Stock por cámara
            crearHojaStockCamara(workbook.createSheet("Stock por cámara"), headerStyle);

            // 3. Movimientos (Filtrados por fechaDesde)
            DateTimeFormatter fmt2 = DateTimeFormatter.ofPattern("dd_MM_yyyy");
            String fechaStr = fechaDesde.format(fmt2);
            crearHojaMovimientos(workbook.createSheet("Movimientos Desde "+ fechaStr), headerStyle, dateStyle, fechaDesde, fmt);

            // 4. Madurez lotes
            crearHojaMadurezLotes(workbook.createSheet("Madurez lotes"), headerStyle, dateStyle, fmt);

            // 5. Mermas
            crearHojaMermas(workbook.createSheet("Mermas"), headerStyle);

            // 6. Remitos
            crearHojaRemitos(workbook.createSheet("Remitos"), headerStyle, dateStyle, fmt);

            // 7. Remitos Detalle
            crearHojaRemitosDetalle(workbook.createSheet("Remitos Detalle"), headerStyle, dateStyle, fmt);

            // 8. Alertas
            crearHojaAlertas(workbook.createSheet("Alertas"), headerStyle);

            // 9. Definiciones
            crearHojaDefiniciones(workbook.createSheet("Definiciones"), headerStyle);

            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Error al generar el reporte Excel " + e.getMessage(), e);
        }
    }

    private CellStyle crearEstiloEncabezado(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.SEA_GREEN.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private void crearHojaStockProducto(Sheet sheet, CellStyle headerStyle) {
        Row header = sheet.createRow(0);
        String[] headers = {"Producto", "Total Hormas", "Total Kgs", "Madur. mín (días)", "Stock mínimo"};
        for (int i = 0; i < headers.length; i++) {
            Cell c = header.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        List<Producto> productos = productoRepository.findByActivoTrueOrderByNombre();
        int rowIdx = 1;
        for (Producto p : productos) {
            List<Stock> stocks = stockRepository.findByLote_Producto_IdAndActivoTrue(p.getId());
            double h = stocks.stream().mapToDouble(s -> s.getHormas() != null ? s.getHormas() : 0).sum();
            double k = stocks.stream().mapToDouble(s -> s.getKgs() != null ? s.getKgs() : 0).sum();

            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue(p.getNombre());
            r.createCell(1).setCellValue(h);
            r.createCell(2).setCellValue(k);
            r.createCell(3).setCellValue(p.getMaduracionDias() != null ? p.getMaduracionDias() : 0);
            r.createCell(4).setCellValue(p.getStockMinimo() != null ? p.getStockMinimo() : 0);
        }
    }

    private void crearHojaStockCamara(Sheet sheet, CellStyle headerStyle) {
        Row header = sheet.createRow(0);
        String[] headers = {"Cámara", "Producto", "Hormas", "Kgs"};
        for (int i = 0; i < headers.length; i++) {
            Cell c = header.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        List<Stock> stocks = stockRepository.findByActivoTrue();
        int rowIdx = 1;
        for (Stock s : stocks) {
            if (s.getLote() != null && s.getLote().getActivo()) {
                Row r = sheet.createRow(rowIdx++);
                r.createCell(0).setCellValue(s.getLote().getCamara() != null ? s.getLote().getCamara().getNombre() : "-");
                r.createCell(1).setCellValue(s.getLote().getProducto() != null ? s.getLote().getProducto().getNombre() : "-");
                r.createCell(2).setCellValue(s.getHormas() != null ? s.getHormas() : 0);
                r.createCell(3).setCellValue(s.getKgs() != null ? s.getKgs() : 0);
            }
        }
    }

    private void crearHojaMovimientos(Sheet sheet, CellStyle headerStyle, CellStyle dateStyle, LocalDate fechaDesde, DateTimeFormatter fmt) {
        Row header = sheet.createRow(0);
        String[] headers = {"ID", "Remito", "Fecha", "Tipo", "Producto", "Lote", "Cámara", "Hormas", "Kgs", "Cliente/Motivo", "Operador", "Obs", "Días desde elab."};
        for (int i = 0; i < headers.length; i++) {
            Cell c = header.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        List<Movimiento> movs = movimientoRepository.findByActivoTrue();
        int rowIdx = 1;
        for (Movimiento m : movs) {
            LocalDate fechaMov = m.getFechaAlta() != null ? m.getFechaAlta().toLocalDate() : null;
            if (fechaDesde != null && fechaMov != null && fechaMov.isBefore(fechaDesde)) {
                continue; // Filtrar anteriores a la fecha especificada
            }

            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue("MOV-" + String.format("%04d", m.getId()));
            r.createCell(1).setCellValue(m.getRemito() != null ? "REM-" + m.getRemito().getId() : "-");
            r.createCell(2).setCellValue(fechaMov != null ? fechaMov.format(fmt) : "-");
            r.createCell(3).setCellValue(obtenerTipoMovTexto(m.getCdTipoMov()));
            r.createCell(4).setCellValue(m.getLote() != null && m.getLote().getProducto() != null ? m.getLote().getProducto().getNombre() : "-");
            r.createCell(5).setCellValue(m.getLote() != null ? m.getLote().getCodigo() : "-");
            r.createCell(6).setCellValue(m.getLote() != null && m.getLote().getCamara() != null ? m.getLote().getCamara().getNombre() : "-");
            r.createCell(7).setCellValue(m.getHormas() != null ? m.getHormas() : 0);
            r.createCell(8).setCellValue(m.getKgs() != null ? m.getKgs() : 0);

            String clienteMotivo = m.getMotivo() != null ? m.getMotivo() : (m.getRemito() != null && m.getRemito().getCliente() != null ? m.getRemito().getCliente().getNombre() : "-");
            r.createCell(9).setCellValue(clienteMotivo);

            String opNombre = "-";
            if (m.getCdOperador() != null) {
                opNombre = operadorRepository.findByIdAndActivoTrue(m.getCdOperador()).map(Operador::getNombre).orElse("-");
            }
            r.createCell(10).setCellValue(opNombre);
            r.createCell(11).setCellValue(m.getObs() != null ? m.getObs() : "");

            long diasElab = 0;
            if (m.getLote() != null && m.getLote().getFechaElaboracion() != null && fechaMov != null) {
                diasElab = ChronoUnit.DAYS.between(m.getLote().getFechaElaboracion(), fechaMov);
            }
            r.createCell(12).setCellValue(diasElab);
        }
    }

    private void crearHojaMadurezLotes(Sheet sheet, CellStyle headerStyle, CellStyle dateStyle, DateTimeFormatter fmt) {
        Row header = sheet.createRow(0);
        String[] headers = {"Lote", "Producto", "Fecha elab.", "Días en cámara", "Madur. mín.", "% madur.", "Estado"};
        for (int i = 0; i < headers.length; i++) {
            Cell c = header.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        List<Stock> stocks = stockRepository.findByActivoTrue();
        int rowIdx = 1;
        LocalDate hoy = LocalDate.now();

        for (Stock s : stocks) {
            if (s.getLote() != null && s.getLote().getFechaElaboracion() != null) {
                Lote l = s.getLote();
                long dias = ChronoUnit.DAYS.between(l.getFechaElaboracion(), hoy);
                long madurMin = l.getProducto() != null && l.getProducto().getMaduracionDias() != null ? l.getProducto().getMaduracionDias() : 1;
                double porc = Math.min(100.0, ((double) dias / madurMin) * 100.0);

                Row r = sheet.createRow(rowIdx++);
                r.createCell(0).setCellValue(l.getCodigo());
                r.createCell(1).setCellValue(l.getProducto() != null ? l.getProducto().getNombre() : "-");
                r.createCell(2).setCellValue(l.getFechaElaboracion().format(fmt));
                r.createCell(3).setCellValue(dias);
                r.createCell(4).setCellValue(madurMin);
                r.createCell(5).setCellValue(Math.round(porc) + "%");
                r.createCell(6).setCellValue(dias >= madurMin ? "Listo" : "En maduración");
            }
        }
    }

    private void crearHojaMermas(Sheet sheet, CellStyle headerStyle) {
        Row header = sheet.createRow(0);
        String[] headers = {"Producto", "H.Egresadas", "Kg.Inicio (*)", "Kg.Egreso", "Merma Kg", "Merma %", "Kg/H ingreso", "Kg/H egreso", "H.En stock"};
        for (int i = 0; i < headers.length; i++) {
            Cell c = header.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        List<MermasEstadisticas> mermas = productoService.obtenerProductosConMermasEstadisticas();
        int rowIdx = 1;
        for (MermasEstadisticas m : mermas) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue(m.getProductoNombre() + " (" + m.getCdCodigoLote() + ")");
            r.createCell(1).setCellValue(m.getEgresoHormas() != null ? m.getEgresoHormas() : 0);
            r.createCell(2).setCellValue(m.getEgresoKgsPpio() != null ? m.getEgresoKgsPpio() : 0);
            r.createCell(3).setCellValue(m.getEgresoKgs() != null ? m.getEgresoKgs() : 0);
            r.createCell(4).setCellValue(m.getMermaKgs() != null ? m.getMermaKgs() : 0);
            r.createCell(5).setCellValue(m.getMermaKgsPorc() != null ? Math.round(m.getMermaKgsPorc()) + "%" : "0%");
            r.createCell(6).setCellValue(m.getPesoKgsXHormaIngreso() != null ? m.getPesoKgsXHormaIngreso() : 0);
            r.createCell(7).setCellValue(m.getPesoKgsXHormaEgreso() != null ? m.getPesoKgsXHormaEgreso() : 0);
            r.createCell(8).setCellValue(m.getHormasStock() != null ? m.getHormasStock() : 0);
        }
    }

    private void crearHojaRemitos(Sheet sheet, CellStyle headerStyle, CellStyle dateStyle, DateTimeFormatter fmt) {
        Row header = sheet.createRow(0);
        String[] headers = {"N° Remito", "Fecha", "Cliente", "Operador", "Observaciones"};
        for (int i = 0; i < headers.length; i++) {
            Cell c = header.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        List<Remito> remitos = remitoRepository.findByActivoTrue();
        int rowIdx = 1;
        for (Remito rem : remitos) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue("REM-" + rem.getId());
            r.createCell(1).setCellValue(rem.getFechaEgreso() != null ? rem.getFechaEgreso().format(fmt) : "-");
            r.createCell(2).setCellValue(rem.getCliente() != null ? rem.getCliente().getNombre() : "-");
            r.createCell(3).setCellValue(rem.getOperador() != null ? rem.getOperador().getNombre() : "-");
            r.createCell(4).setCellValue(rem.getObservaciones() != null ? rem.getObservaciones() : "");
        }
    }

    private void crearHojaRemitosDetalle(Sheet sheet, CellStyle headerStyle, CellStyle dateStyle, DateTimeFormatter fmt) {
        Row header = sheet.createRow(0);
        String[] headers = {"N° Remito", "Fecha Remito", "Cliente", "Producto", "Lote", "Cámara", "Hormas", "Kgs", "Operador"};
        for (int i = 0; i < headers.length; i++) {
            Cell c = header.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        List<Movimiento> movs = movimientoRepository.findByActivoTrue();
        int rowIdx = 1;
        for (Movimiento m : movs) {
            if (m.getCdTipoMov() != null && m.getCdTipoMov() == 2L && m.getRemito() != null) { // EGRESO con Remito
                Row r = sheet.createRow(rowIdx++);
                r.createCell(0).setCellValue("REM-" + m.getRemito().getId());
                r.createCell(1).setCellValue(m.getRemito().getFechaEgreso() != null ? m.getRemito().getFechaEgreso().format(fmt) : "-");
                r.createCell(2).setCellValue(m.getRemito().getCliente() != null ? m.getRemito().getCliente().getNombre() : "-");
                r.createCell(3).setCellValue(m.getLote() != null && m.getLote().getProducto() != null ? m.getLote().getProducto().getNombre() : "-");
                r.createCell(4).setCellValue(m.getLote() != null ? m.getLote().getCodigo() : "-");
                r.createCell(5).setCellValue(m.getLote() != null && m.getLote().getCamara() != null ? m.getLote().getCamara().getNombre() : "-");
                r.createCell(6).setCellValue(m.getHormas() != null ? m.getHormas() : 0);
                r.createCell(7).setCellValue(m.getKgs() != null ? m.getKgs() : 0);
                r.createCell(8).setCellValue(m.getRemito().getOperador() != null ? m.getRemito().getOperador().getNombre() : "-");
            }
        }
    }

    private void crearHojaAlertas(Sheet sheet, CellStyle headerStyle) {
        Row header = sheet.createRow(0);
        String[] headers = {"Severidad", "Producto", "Detalle"};
        for (int i = 0; i < headers.length; i++) {
            Cell c = header.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        List<Alertas> alertas = movimientoService.obtenerAlertas();
        int rowIdx = 1;
        for (Alertas a : alertas) {
            Row r = sheet.createRow(rowIdx++);
            String sev = a.getNivelAlerta() == 4 ? "CRÍTICA" : (a.getNivelAlerta() == 3 ? "ALTA" : "MEDIA");
            r.createCell(0).setCellValue(sev);
            r.createCell(1).setCellValue(a.getProductoNombre() != null ? a.getProductoNombre() : "-");
            r.createCell(2).setCellValue(a.getMensajeAlerta() != null ? a.getMensajeAlerta() : "-");
        }
    }

    private void crearHojaDefiniciones(Sheet sheet, CellStyle headerStyle) {
        Row header = sheet.createRow(0);
        String[] headers = {"Sección", "Nombre", "Detalle", "Activo"};
        for (int i = 0; i < headers.length; i++) {
            Cell c = header.createCell(i);
            c.setCellValue(headers[i]);
            c.setCellStyle(headerStyle);
        }

        int rowIdx = 1;
        for (Producto p : productoRepository.findAll()) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue("Producto");
            r.createCell(1).setCellValue(p.getNombre());
            r.createCell(2).setCellValue("Madur." + p.getMaduracionDias() + "d | Mín:" + p.getStockMinimo() + "H");
            r.createCell(3).setCellValue(p.getActivo() ? "Sí" : "No");
        }
        for (Camara c : camaraRepository.findAll()) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue("Cámara");
            r.createCell(1).setCellValue(c.getNombre());
            r.createCell(2).setCellValue("-");
            r.createCell(3).setCellValue(c.getActivo() ? "Sí" : "No");
        }
        for (Cliente cl : clienteRepository.findAll()) {
            Row r = sheet.createRow(rowIdx++);
            r.createCell(0).setCellValue("Cliente");
            r.createCell(1).setCellValue(cl.getNombre());
            r.createCell(2).setCellValue("-");
            r.createCell(3).setCellValue(cl.getActivo() ? "Sí" : "No");
        }
    }

    private String obtenerTipoMovTexto(Long tipo) {
        if (tipo == null) return "-";
        switch (tipo.intValue()) {
            case 1: return "INGRESO";
            case 2: return "EGRESO";
            case 3: return "AJUSTE";
            case 4: return "TRANSFERENCIA";
            default: return "-";
        }
    }
}