package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Campania;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;


@Repository
public interface CampaniaRepository extends JpaRepository<Campania, Long> {
    ArrayList<Campania> findByActivoTrue();
    Campania findByIdAndActivoTrue(Long id);
    @Modifying
    @Query(value = "TRUNCATE TABLE campania", nativeQuery = true)
    void vaciarTabla();
}