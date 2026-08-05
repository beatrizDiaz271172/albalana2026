package com.tuempresa.proyecto.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovimientoRequest {

    private Long cdTipoMov;
    private LocalDate fechaElaboracion;
    private Long cdProducto;
    private Long cdLote;
    private Long cdCamara;
    private Double hormas;
    private Double kgs;
    private Double ltsLeche;
    private String fermento;
    private String obs;
    private Long cdOperador;
    private Long cdCliente;
    private String motivo;
}
