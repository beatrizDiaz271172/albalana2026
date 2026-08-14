package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Remito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RemitoRepository extends JpaRepository<Remito, Long> {
}
