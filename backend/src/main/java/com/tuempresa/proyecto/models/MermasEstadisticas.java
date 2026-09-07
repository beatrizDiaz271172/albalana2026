package com.tuempresa.proyecto.models;

import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString

public class MermasEstadisticas {

    private Long productoId;

    private String productoNombre;
    
    private String cdCodigoLote; //codigo del Lote

    private Double egresoHormas;
    
    private Double egresoKgs;
    
    private Double egresoKgsPpio;

    private Double pesoKgsXHormaIngreso;

    private Double pesoKgsXHormaEgreso;

    private Double hormasStock;

    private Double kgsStockReal;

    private Double kgsStockSinMerma;

    private Double mermaKgs;

    private Double mermaKgsPorc;

    private Double mermaStock;

    
} 
  
