package com.tuempresa.proyecto.exceptions;

public class ReferenciaExistenteException extends RuntimeException {
    public ReferenciaExistenteException(String mensaje) {
        super(mensaje);
    }
}
