package com.tuempresa.proyecto.services;
import java.io.ByteArrayInputStream;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tuempresa.proyecto.models.*;
import com.tuempresa.proyecto.repositories.MovimientoRepository;
import com.tuempresa.proyecto.repositories.ProductoRepository;
import com.tuempresa.proyecto.repositories.StockRepository;

@Service
public class ExcelService {
    @Autowired
    private MovimientoRepository movimientoRepository;
    private StockRepository stockRepository;
    private ProductoRepository productoRepository;

    public ByteArrayInputStream generarExcelUsuarios() {
        List<Movimiento> movimientos = movimientoRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Campania");

            // Crear fila de encabezados
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("ID");
            headerRow.createCell(1).setCellValue("Nombre");
            headerRow.createCell(2).setCellValue("Correo");

            // Poblar datos de la base de datos
            int rowIdx = 1;
            for (Usuario u : usuarios) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(u.getId());
                row.createCell(1).setCellValue(u.getNombre());
                row.createCell(2).setCellValue(u.getCorreo());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Error al importar los datos a Excel: " + e.getMessage());
        }
    }
}