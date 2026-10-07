package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Operador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OperadorRepository extends JpaRepository<Operador, Long> {
    
    List<Operador> findByActivoTrue();
    Optional <Operador> findByIdAndActivoTrue(Long id);
    Operador findByNombreAndActivoTrue(String nombre);
    @Modifying
    @Query(value = "TRUNCATE TABLE operador", nativeQuery = true)
    void vaciarTabla();
}
