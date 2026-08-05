package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Camara;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface CamaraRepository extends JpaRepository<Camara, Long> {

}