package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Remito;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RemitoRepository extends JpaRepository<Remito, Long> {
   Optional <Remito> findById(Long productoId);
   Remito findByCodigoJsonAndActivoTrue(String codigo);
   List<Remito> findByActivoTrue();
}
