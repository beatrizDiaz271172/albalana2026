package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.dtos.OperadorRequest;
import com.tuempresa.proyecto.models.Operador;
import com.tuempresa.proyecto.repositories.OperadorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OperadorService {

    private final OperadorRepository operadorRepository;

    public OperadorService(OperadorRepository operadorRepository) {
        this.operadorRepository = operadorRepository;
    }

    public List<Operador> obtenerActivos() {
        return operadorRepository.findByActivoTrue();
    }

    @Transactional
    public Operador crearOperador(OperadorRequest request) {
        String nombre = validarNombre(request);

        if (operadorRepository.existsByNombreIgnoreCaseAndActivoTrue(nombre)) {
            throw new IllegalArgumentException("El nombre del operador ya existe");
        }
        return operadorRepository.save(new Operador(nombre));
    }

    @Transactional
    public Operador actualizarOperador(Long id, OperadorRequest request) {
        String nombre = validarNombre(request);

        Operador operador = operadorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Operador no encontrado con ID: " + id));

        // Validar duplicado solo si cambió el nombre
        if (!operador.getNombre().equalsIgnoreCase(nombre)
                && operadorRepository.existsByNombreIgnoreCaseAndActivoTrue(nombre)) {
            throw new IllegalArgumentException("El nombre del operador ya existe");
        }

        operador.setNombre(nombre);
        return operadorRepository.save(operador);
    }

    private String validarNombre(OperadorRequest request) {
        if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio");
        }
        return request.getNombre().trim();
    }
}