package com.tuempresa.proyecto.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RemitoRequest {

    private LocalDate fechaEgreso;
    private Long cdCliente;
    private Long cdOperador;
    private String observaciones;
    private List<ItemRemitoRequest> items;
}
