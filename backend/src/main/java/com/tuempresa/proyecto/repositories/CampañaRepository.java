package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Campaña;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;


@Repository
public interface CampañaRepository extends JpaRepository<Campaña, Long> {
    ArrayList<Campaña> findByActivoTrue();
}