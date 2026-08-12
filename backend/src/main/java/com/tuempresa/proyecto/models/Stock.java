/* 
      {
    
    "camara": "Camara 1",
    "hormas": 10,
    "kgs": 30.0,
    "timestamp_editado": "2026-05-29T13:36:02.737938"
  },*/
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
    @JoinColumn(name = "cd_producto", nullable = false) 
    private Producto producto;

    // Relación ManyToOne para la Clave Foránea
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cd_camara", nullable = false) 
    private Camara camara;

    private Double hormas;

    private Double kgs;
    
    @Column(name = "fecha_alta")
    private LocalDateTime fechaAlta;

    @Column(name = "fecha_emision")
    private LocalDateTime fechaEmision;
} 
