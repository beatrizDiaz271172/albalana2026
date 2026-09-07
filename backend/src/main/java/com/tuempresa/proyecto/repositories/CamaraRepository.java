package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Camara;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface CamaraRepository extends JpaRepository<Camara, Long> {
    List<Camara> findByActivoTrue();
    boolean existsByNombreIgnoreCase(String nombre);
}