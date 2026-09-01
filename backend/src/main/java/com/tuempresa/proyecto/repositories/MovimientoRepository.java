package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Movimiento;
 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {
  List<Movimiento> findByRemito_Id(Long remitoId);
  List<Movimiento>findByCdTipoMovAndLote_Producto_id(Integer cdTipoMov, Long productoId);
}