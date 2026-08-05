package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {
 
}