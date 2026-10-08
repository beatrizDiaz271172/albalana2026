package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    List<Cliente> findByActivoTrue();
    Cliente findByNombreAndActivoTrue(String nombre);
    @Modifying
    @Query(value = "DELETE FROM cliente", nativeQuery = true)
    void vaciarTabla();
}
