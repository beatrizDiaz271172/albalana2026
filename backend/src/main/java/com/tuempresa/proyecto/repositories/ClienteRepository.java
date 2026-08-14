package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    // Para el buscador "Escribí para filtrar..." del remito
    List<Cliente> findByActivoTrue();
}
