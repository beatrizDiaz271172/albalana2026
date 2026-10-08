package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Camara;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface CamaraRepository extends JpaRepository<Camara, Long> {
    List<Camara> findByActivoTrue();
    boolean existsByNombreIgnoreCase(String nombre);
    Camara findByNombre(String nombre);

    @Modifying
    @Query(value = "DELETE FROM camara", nativeQuery = true)
    void vaciarTabla();
}