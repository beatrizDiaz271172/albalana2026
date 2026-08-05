package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Operador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperadorRepository extends JpaRepository<Operador, Long> {
    
    // Método para obtener solo los operadores activos en los select del frontend
    List<Operador> findByActivoTrue();
}
