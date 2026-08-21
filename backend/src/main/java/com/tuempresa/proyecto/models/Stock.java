package com.tuempresa.proyecto.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
     // Relación ManyToOne para la Clave Foránea
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cd_lote", nullable = false) 
    private Lote lote;

    private Double hormas;

    private Double kgs;
    
    @Column(name = "fecha_alta")
    private LocalDateTime fechaAlta;

    @Column(name = "fecha_emision")
    private LocalDateTime fechaEmision;

  @Column(name = "activo")
  private Boolean activo = true;
} 
