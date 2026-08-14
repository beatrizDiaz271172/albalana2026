package com.tuempresa.proyecto.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "remito")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Remito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_egreso")
    private LocalDate fechaEgreso;

    // Relación ManyToOne con el cliente destinatario del remito
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cd_cliente")
    private Cliente cliente;

    @Column(name = "cd_operador")
    private Long cdOperador;

    @Column(name = "observaciones", length = 1000)
    private String observaciones;

    @Column(name = "fecha_alta")
    private LocalDateTime fechaAlta;
}
