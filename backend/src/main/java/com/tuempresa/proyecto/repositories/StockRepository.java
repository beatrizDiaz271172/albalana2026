package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Movimiento;
import com.tuempresa.proyecto.models.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    List<Stock> findByArchivadoId(Long campaniaId);
    List<Stock> findByActivoTrue();
    Stock findByLote_IdAndActivoTrue(Long loteId);
    List<Stock> findByLote_Producto_IdAndLote_Camara_IdAndActivoTrue(Long idProducto, Long idCamara);
    List<Stock> findByLote_Producto_IdAndActivoTrue(Long idProducto);
    List<Stock> findByLote_Producto_IdAndArchivadoId(Long idProducto, Long companiaId);
    @Modifying
    @Query(value = "DELETE FROM stock", nativeQuery = true)
    void vaciarTabla();
}