package com.tuempresa.proyecto.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lote") // Cambia a "lotes" si tu tabla en la BD está en plural
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Lote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cd_lote")
    private Long cdLote; // 👈 Cambiado de id a cdLote

    @Column(name = "codigo", nullable = false)
    private String codigo;

    @Column(name = "activo")
    private Boolean activo = true;
}