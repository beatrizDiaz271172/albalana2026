package com.tuempresa.proyecto.models;

import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString

public class Alertas {

    private Long productoId;

    private String productoNombre;

    private Long loteId;

    private String loteNombre;

    private Long dias;

    private Double hormas;
    
    private String mensajeAlerta;
    
    private Integer tipoAlerta;

     private Integer nivelAlerta;
    } 
  
