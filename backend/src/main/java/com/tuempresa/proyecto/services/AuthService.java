
package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.dtos.LoginRequest;
import com.tuempresa.proyecto.dtos.LoginResponse;
import com.tuempresa.proyecto.models.Usuario;
import com.tuempresa.proyecto.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public LoginResponse autenticar(LoginRequest request) {
        // Busca al usuario en la base de datos PostgreSQL por su campo de usuario/username
        List<Usuario> todos = usuarioRepository.findAll();
        System.out.println(">>> TOTAL USUARIOS EN BD: " + todos.size());
        todos.forEach(u -> System.out.println(">>> USUARIO ENCONTRADO: " + u.getUsuario()));
        System.out.println("Usuario de request: '" + request.getUsuario()+"'");
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsuario(request.getUsuario());

        if (usuarioOpt.isPresent()) {
            
            Usuario usuario = usuarioOpt.get();
            System.out.println("Encontro Usuario: " + usuario.getNombre());
            // Verificación simple de contraseña (para producción se recomienda BCryptPasswordEncoder)
            if (usuario.getPassword().equals(request.getPassword())) {
                System.out.println("Encontro Pasword ok: " + usuario.getPassword());
                return new LoginResponse(true, "Inicio de sesión exitoso", usuario.getUsuario());
            }
        }
        System.out.println("NO Encontro Usuario: " + usuarioOpt);
        
        return new LoginResponse(false, "Usuario o contraseña incorrectos", null);
    }
}