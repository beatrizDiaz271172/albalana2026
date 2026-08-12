package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findByProductoIdAndCamaraId(Long idProducto, Long idCamara);
}