package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.dtos.UsuarioRequest;
import com.tuempresa.proyecto.models.Usuario;
import com.tuempresa.proyecto.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;

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
}