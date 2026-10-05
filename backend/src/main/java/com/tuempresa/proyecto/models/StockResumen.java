package com.tuempresa.proyecto.models;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockResumen {

    private Producto producto;
    
    private Double hormas;

    private Double kgs;

}
