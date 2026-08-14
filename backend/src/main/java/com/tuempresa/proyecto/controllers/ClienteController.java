package com.tuempresa.proyecto.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tuempresa.proyecto.models.Cliente;
import com.tuempresa.proyecto.repositories.ClienteRepository;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteRepository clienteRepository;

    public ClienteController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    // GET: Obtener todos los clientes activos (para el buscador del remito)
    @GetMapping
    public ResponseEntity<List<Cliente>> obtenerTodos() {
        return ResponseEntity.ok(clienteRepository.findByActivoTrue());
    }

    // POST: Alta rápida de un cliente nuevo
    @PostMapping
    public ResponseEntity<Cliente> crearCliente(@RequestBody Cliente cliente) {
        Cliente nuevo = clienteRepository.save(cliente);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }
}
