package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.dtos.LoginResponse;
import com.tuempresa.proyecto.dtos.UsuarioRequest;
import com.tuempresa.proyecto.models.Usuario;
import com.tuempresa.proyecto.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<Usuario> obtenerTodos() {
        List<Usuario> usuarios= usuarioRepository.findAll();
        return usuarios;
    }

    public Usuario guardarUsuario(UsuarioRequest request) {
        Usuario usuario = new Usuario(request.getNombre(), request.getEmail(), request.getUsuario(), request.getPassword());
        return usuarioRepository.save(usuario);
    }

    public Usuario actualizarPassword(String usu, String passwordActual, String nuevaPassword){
       Optional<Usuario> usuarioOpt = usuarioRepository.findByUsuario(usu);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (usuario.getPassword().equals(passwordActual)) {
                usuario.setPassword(nuevaPassword);
                return usuarioRepository.save(usuario);
            }
        }

        return null;
    }
}