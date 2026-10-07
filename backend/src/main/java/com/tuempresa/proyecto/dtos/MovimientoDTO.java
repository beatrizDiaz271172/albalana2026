package com.tuempresa.proyecto.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor

@JsonIgnoreProperties(ignoreUnknown = true)
public class MovimientoDTO {

    private String id;
    private String tipo;
    private String timestamp;
    private String fecha;              // viene como "26/05/2026"
    private String producto;
    private String lote;
    private String camara;
    private Double hormas;
    private Double kgs;

    @JsonProperty("lts_leche")
    private Double ltsLeche;

    private String fermento;
    private String obs;
    private String operador;
    private String cliente;
    private String motivo;
    private String remito;

    @JsonProperty("timestamp_editado")
    private String timestampEditado;

}
