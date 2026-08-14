package com.tuempresa.proyecto.models;

import java.time.LocalDate;

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
    @Column(name = "id") // Mapea a la clave primaria en la BD
    private Long id;
    
    @Column(name = "codigo", nullable = false)
    private String codigo;

     // Relación ManyToOne para la Clave Foránea
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cd_producto", nullable = false) 
    private Producto producto;

    // Relación ManyToOne para la Clave Foránea
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cd_camara", nullable = false) 
    private Camara camara;

    @Column(name = "fecha_elaboracion")
    private LocalDate fechaElaboracion;
    
    @Column(name = "activo")
    private Boolean activo = true;
}