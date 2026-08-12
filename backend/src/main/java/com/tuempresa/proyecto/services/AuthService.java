package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.dtos.LoginRequest;
import com.tuempresa.proyecto.dtos.LoginResponse;
import com.tuempresa.proyecto.models.Usuario;
import com.tuempresa.proyecto.repositories.UsuarioRepository;
import com.tuempresa.proyecto.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public LoginResponse autenticar(LoginRequest request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsuario(request.getUsuario());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            // Verificación simple de contraseña (para producción se recomienda BCryptPasswordEncoder)
            if (usuario.getPassword().equals(request.getPassword())) {
                String token = jwtUtil.generarToken(usuario.getUsuario());
                return new LoginResponse(true, "Inicio de sesión exitoso", usuario.getUsuario(), token);
            }
        }

        return new LoginResponse(false, "Usuario o contraseña incorrectos", null, null);
    }
}
