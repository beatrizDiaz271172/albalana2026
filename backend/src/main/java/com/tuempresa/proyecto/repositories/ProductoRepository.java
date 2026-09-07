package com.tuempresa.proyecto.repositories;
import java.util.List;

import com.tuempresa.proyecto.models.Producto;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    boolean existsByNombreIgnoreCase(String nombre);
    List<Producto> findByActivoTrue();
   
}
