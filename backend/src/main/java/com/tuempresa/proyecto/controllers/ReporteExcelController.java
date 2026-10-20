package com.tuempresa.proyecto.controllers;

import com.tuempresa.proyecto.services.ReporteExcelService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reportes")
public class ReporteExcelController {

    private final ReporteExcelService reporteExcelService;

    public ReporteExcelController(ReporteExcelService reporteExcelService) {
        this.reporteExcelService = reporteExcelService;
    }

    @GetMapping("/excel")
    public ResponseEntity<byte[]> exportarExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde) {

        byte[] datosExcel = reporteExcelService.generarReporteExcelDinamico(fechaDesde);

        String filename = "Reporte_Stock_Alba_" + LocalDate.now() + ".xlsx";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(datosExcel, headers, HttpStatus.OK);
    }
}