package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    Stock findByLote_IdAndActivoTrue(Long loteId);

    // NUEVO: Busca el stock filtrando directamente a través de las entidades Lote -> Producto y Lote -> Cámara
    List<Stock> findByLote_Producto_IdAndLote_Camara_IdAndActivoTrue(Long idProducto, Long idCamara);
}