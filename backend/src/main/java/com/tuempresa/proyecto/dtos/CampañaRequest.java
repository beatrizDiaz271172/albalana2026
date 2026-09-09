package com.tuempresa.proyecto.dtos;

import java.time.LocalDate;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CampañaRequest {

    private Long id;
    private String nombre; 
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Long cantMov;
    private Double cantHormas;
    private Double cantKilos;
    boolean desdeCero;
}
