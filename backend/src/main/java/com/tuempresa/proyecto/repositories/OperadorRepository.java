package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Operador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OperadorRepository extends JpaRepository<Operador, Long> {
    
    List<Operador> findByActivoTrue();
    Optional <Operador> findByIdAndActivoTrue(Long id);
}
