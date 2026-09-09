package com.tuempresa.proyecto.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "campania") // o el nombre exacto de tu tabla
@Getter                  // 👈 OBLIGATORIO: Necesario para que Jackson pueda serializar a JSON
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Campaña {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id") // Mapea a la clave primaria en la BD
    private Long id;

    @Column(name = "fecha_inicio")
    public LocalDate fechaInicio;
    
    @Column(name = "fecha_fin")
    public LocalDate fechaFin;
    
    public String nombre;

    @Column(name = "cant_mov")
    private Long cantMov;

    @Column(name = "cant_hormas")
    private Double cantHormas;

    @Column(name = "cant_kgs")
    private Double cantKilos;

    private Boolean activo = true;

       public Campaña(String nombre, LocalDate fechaIni, LocalDate fechaFin, Long cantMov, Double cantHormas, Double cantKilos){
        this.nombre = nombre;
        this.fechaInicio = fechaIni;
        this.fechaFin = fechaFin;
        this.activo = true;
        this.cantMov = cantMov;
        this.cantHormas = cantHormas;
        this.cantKilos = cantKilos;
        this.activo = true;
    }
}
