package com.tuempresa.proyecto.controllers;

import java.util.Collections;

import com.tuempresa.proyecto.dtos.LoginRequest;
import com.tuempresa.proyecto.dtos.LoginResponse;
import com.tuempresa.proyecto.dtos.UsuarioRequest;
import com.tuempresa.proyecto.models.Usuario;
import com.tuempresa.proyecto.services.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.obtenerTodos());
    }

    @PostMapping
    public ResponseEntity<Usuario> crearUsuario(@RequestBody UsuarioRequest request) {
        Usuario nuevoUsuario = usuarioService.guardarUsuario(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
    }
    @PutMapping("/cambiar-password")
    public ResponseEntity<?> cambiarPassword(@RequestBody UsuarioRequest dto, Principal principal) {
        // principal.getName() obtiene el usuario autenticado por JWT
        try {
            Usuario usuario = usuarioService.actualizarPassword(principal.getName(), dto.getPassword(), dto.getNuevaPassword());
            if (usuario == null){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Contraseña actual incorrecta. Vuelva a intentar."));
            } else return ResponseEntity.ok(Collections.singletonMap("mensaje", "Contraseña actualizada con éxito"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }
   
}