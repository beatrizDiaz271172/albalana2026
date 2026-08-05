package com.tuempresa.proyecto.dtos;

public class LoginResponse {
    private boolean exito;
    private String mensaje;
    private String usuario;

    public LoginResponse(boolean exito, String mensaje, String usuario) {
        this.exito = exito;
        this.mensaje = mensaje;
        this.usuario = usuario;
    }

    public boolean isExito() { return exito; }
    public String getMensaje() { return mensaje; }
    public String getUsuario() { return usuario; }
} 
