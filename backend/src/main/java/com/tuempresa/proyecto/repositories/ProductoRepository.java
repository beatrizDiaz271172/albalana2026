package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

}