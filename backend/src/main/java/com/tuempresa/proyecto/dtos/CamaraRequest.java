package com.tuempresa.proyecto.dtos;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CamaraRequest {

    private Long id;
    private String nombre; 
}
