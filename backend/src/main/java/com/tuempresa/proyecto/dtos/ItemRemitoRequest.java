package com.tuempresa.proyecto.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemRemitoRequest {

    private Long cdProducto;
    private Long cdCamara;
    private String cdLote;
    private Long idLote;
    private Double hormas; // hormas / cuñas
    private Double kgs;
}
