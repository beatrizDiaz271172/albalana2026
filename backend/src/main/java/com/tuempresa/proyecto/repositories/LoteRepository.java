package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {
    
    // Método para buscar lotes por código exacto
    Lote findByCodigo(String codigo);

    // Método para traer solo los lotes activos
    List<Lote> findByActivoTrue();

     List<Lote> findByProducto_IdAndCamara_Id( Long idProducto, Long idCamara);
}