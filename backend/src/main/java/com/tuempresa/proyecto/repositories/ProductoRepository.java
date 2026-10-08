package com.tuempresa.proyecto.repositories;
import java.util.*;

import com.tuempresa.proyecto.models.Producto;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    boolean existsByNombreIgnoreCase(String nombre);
    List<Producto> findByActivoTrue();
    Producto findByNombre(String nombre);
    @Modifying
    @Query(value = "DELETE FROM producto", nativeQuery = true)
    void vaciarTabla();
   
}
