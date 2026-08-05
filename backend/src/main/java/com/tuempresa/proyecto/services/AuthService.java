
package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.dtos.LoginRequest;
import com.tuempresa.proyecto.dtos.LoginResponse;
import com.tuempresa.proyecto.models.Usuario;
import com.tuempresa.proyecto.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public LoginResponse autenticar(LoginRequest request) {
        // Busca al usuario en la base de datos PostgreSQL por su campo de usuario/username
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsuario(request.getUsuario());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            // Verificación simple de contraseña (para producción se recomienda BCryptPasswordEncoder)
            if (usuario.getPassword().equals(request.getPassword())) {
                return new LoginResponse(true, "Inicio de sesión exitoso", usuario.getUsuario());
            }
        }
        
        return new LoginResponse(false, "Usuario o contraseña incorrectos", null);
    }
}