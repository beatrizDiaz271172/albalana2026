package com.tuempresa.proyecto.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.*;

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
     
    // Relación ManyToOne para la Clave Foránea
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cd_lote", nullable = false) 
    private Lote lote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cd_remito", nullable = true) 
    private Remito remito;

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
    private LocalDate fechaEditado;
}