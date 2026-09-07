package com.tuempresa.proyecto.services;


import com.tuempresa.proyecto.dtos.CamaraRequest;
import com.tuempresa.proyecto.dtos.ProductoRequest;
import com.tuempresa.proyecto.models.*;
import com.tuempresa.proyecto.repositories.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CamaraService {

    private final CamaraRepository camaraRepository;
    private final LoteRepository loteRepository;

    public CamaraService(CamaraRepository CamaraRepository, LoteRepository LoteRepository) {
        this.camaraRepository = CamaraRepository;
        this.loteRepository = LoteRepository;
    }

public List<Camara> obtenerPorProductoId(Long productoId) {
    List<Lote> lotes = loteRepository.findByProducto_IdAndActivoTrue(productoId);
    
    // Usamos un Set para evitar cámaras duplicadas si varios lotes comparten la misma cámara
    Set<Camara> camarasUnicas = new HashSet<>();
    
    lotes.forEach(lote -> {
        // Validamos que el lote tenga una cámara asociada para evitar NullPointer
        if (lote.getCamara() != null) {
            // findById devuelve Optional<Camara>
            Optional<Camara> camaraOpt = camaraRepository.findById(lote.getCamara().getId());
            
            // Verificamos si la cámara realmente existe en la base de datos
            camaraOpt.ifPresent(camarasUnicas::add);
        }
    });
    
    // Convertimos el Set a List para mantener la firma del método
    return new ArrayList<>(camarasUnicas);
}

 public Camara guardarCamara(CamaraRequest request) {
        Camara camara = new Camara(request.getNombre());
        return camaraRepository.save(camara);
}


public Camara actualizarCamara(Long id, CamaraRequest request) {
 Camara camara = camaraRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Camara no encontrado con ID: " + id));
    
    // ✅ Validar que el nombre no esté duplicado (excepto el actual)
    if (!camara.getNombre().equalsIgnoreCase(request.getNombre())) {
        boolean nombreDuplicado = camaraRepository.existsByNombreIgnoreCase(request.getNombre());
        if (nombreDuplicado) {
            throw new IllegalArgumentException("El nombre de la camara ya existe");
        }
    }
    
    // Actualizar campos
    camara.setNombre(request.getNombre());
    
    return camaraRepository.save(camara);
}
    
}