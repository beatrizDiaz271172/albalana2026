package com.tuempresa.proyecto.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "producto") // o el nombre exacto de tu tabla
@Getter                  // 👈 OBLIGATORIO: Necesario para que Jackson pueda serializar a JSON
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre; 

    private String codigo; 

     @Column(name = "maduracion_dias")
    private Long maduracionDias;

    @Column(name = "consumo_opt_dias")
    private Long consumoOptDias;

    @Column(name = "stock_minimo")
    private Long stockMinimo;

    public Producto(String nombre, String codigo, Long maduracionDias, Long consumoOptDias, Long stockMinimo){
        this.nombre=nombre;
        this.codigo=codigo;
        this.maduracionDias=maduracionDias;
        this.consumoOptDias=consumoOptDias;
        this.stockMinimo=stockMinimo;
    }
}