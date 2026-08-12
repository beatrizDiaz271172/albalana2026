/* 
      {
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
    "timestamp_editado": "2026-05-29T13:36:02.737938"
  },*/
package com.tuempresa.proyecto.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cd_tipo_mov")
    private Long cdTipoMov;

    @Column(name = "fecha_elaboracion")
    private LocalDate fechaElaboracion;
    
    // Relación ManyToOne para la Clave Foránea
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cd_producto", nullable = false) 
    private Producto producto;
     
    private String cdLote;

     private Long cdRemito;


    // Relación ManyToOne para la Clave Foránea
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cd_camara", nullable = false) 
    private Camara camara;
    
    /*@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cd_camara_destino", nullable = false) 
    private Camara camaraDestino;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cd_cliente", nullable = false) 
    private Cliente cliente;*/

    private Double hormas;

    private Double kgs;

    @Column(name = "lts_leche")
    private Double ltsLeche;

    private String fermento;

    private String obs;

    @Column(name = "cd_operador")
    private Long cdOperador;

    private String motivo;

    @Column(name = "fecha_alta")
    private LocalDateTime fechaAlta;

    @Column(name = "fecha_editado")
    private LocalDateTime fechaEditado;
}