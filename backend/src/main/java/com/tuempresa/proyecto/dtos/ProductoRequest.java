package com.tuempresa.proyecto.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoRequest {

    private Long id;
    private String nombre; 
    private String codigo; 
    private Long maduracionDias;
    private Long consumoOptDias;
    private Long stockMinimo;
}
