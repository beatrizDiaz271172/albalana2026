package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Lote;
import com.tuempresa.proyecto.models.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

     Stock findByLoteId(Long loteId);
}