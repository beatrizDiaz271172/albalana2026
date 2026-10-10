package com.tuempresa.proyecto.services;

import com.tuempresa.proyecto.dtos.ClienteRequest;
import com.tuempresa.proyecto.models.*;
import com.tuempresa.proyecto.repositories.*;
import org.springframework.stereotype.Service;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    

    public ClienteService(ClienteRepository cLienteRepository) {
        this.clienteRepository = cLienteRepository;
    }
public Cliente actualizarCliente(Long id, ClienteRequest request) {
 Cliente cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado con ID: " + id));
    
    // ✅ Validar que el nombre no esté duplicado (excepto el actual)
    if (!cliente.getNombre().equalsIgnoreCase(request.getNombre())) {
        boolean nombreDuplicado = clienteRepository.existsByNombreIgnoreCase(request.getNombre());
        if (nombreDuplicado) {
            throw new IllegalArgumentException("El nombre del cliente ya existe");
        }
    }
    
    // Actualizar campos
    cliente.setNombre(request.getNombre());
    
    return clienteRepository.save(cliente);
}
    
}