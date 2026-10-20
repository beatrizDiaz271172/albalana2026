package com.tuempresa.proyecto.dtos;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor

public class ProductoRequest {

    private Long id;
    private String nombre; 
    private String codigo; 
    private Long maduracionDias;
    private Long consumoOptDias;
    private Long stockMinimo;
    private Long preMaduracionDias;
    private Long postMaduracionDias;
    private Long diasSinMov;
}
