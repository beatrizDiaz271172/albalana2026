package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {
    
    // Método para buscar lotes por código exacto
   // Lote findByCodigoAndActivoTrue(String codigo);

    // Método para traer solo los lotes activos
    List<Lote> findAllByActivoTrue();

    List<Lote> findByProducto_IdAndCamara_IdAndActivoTrue( Long idProducto, Long idCamara);

    List<Lote> findByProducto_IdAndActivoTrue( Long idProducto);
}