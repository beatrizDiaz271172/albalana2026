package com.tuempresa.proyecto.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "camara") // o el nombre exacto de tu tabla
@Getter                  
@Setter
@NoArgsConstructor

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Camara {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre; 

    private Boolean activo = true;

    public Camara(String nombre){
        this.nombre = nombre;
        this.activo = true;
    }
}