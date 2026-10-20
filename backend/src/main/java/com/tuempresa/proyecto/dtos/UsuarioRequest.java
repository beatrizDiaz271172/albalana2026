package com.tuempresa.proyecto.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor

public class UsuarioRequest {
    private String nombre;
    private String email;
    private String usuario;
    private String password;
    private String nuevaPassword;

    
    public UsuarioRequest(String nombre, String email) {
        this.nombre = nombre;
        this.email = email;
    }

    
}