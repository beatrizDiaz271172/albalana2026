package com.tuempresa.proyecto.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
/* 
"id": "MOV-0001",
    "tipo": "INGRESO",
    "timestamp": "2026-05-26T14:10:43.661119",
    "fecha": "26/05/2026",
    "producto": "Peco. Reserva",
    "lote": "PR01",
    "camara": "Camara 1",
    "hormas": 10,
    "kgs": 30.0,
    "lts_leche": 0.0,
    "fermento": "",
    "obs": "",
    "operador": "Loro",
    "cliente": "",
    "motivo": "",
    "timestamp_editado": "2026-05-29T13:36:02.737938" */
public class MovimientoDTO {

    private String id; 
    private String tipo;
    private LocalDate timestamp;
    private LocalDate fecha;
    private String producto;
    private String lote;
    private String camara;
    private String camaraDestino;
    private Double hormas;
    private Double kgs;
    private Double lts_leche;
    private String fermento;
    private String obs;
    private String operador;
    private String cliente;
    private String motivo;
     private LocalDate timestamp_editado;
}
