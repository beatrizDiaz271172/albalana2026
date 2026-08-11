package com.tuempresa.proyecto.controllers;

import com.tuempresa.proyecto.dtos.LoginRequest;
import com.tuempresa.proyecto.dtos.LoginResponse;
import com.tuempresa.proyecto.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://192.168.0.32:5173"})
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse respuesta = authService.autenticar(request);
        if (respuesta.isExito()) {
            return ResponseEntity.ok(respuesta);
        } else {
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(respuesta);
        }
    }
}