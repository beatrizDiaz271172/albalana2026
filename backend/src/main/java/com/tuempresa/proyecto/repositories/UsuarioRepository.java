package com.tuempresa.proyecto.repositories;

import com.tuempresa.proyecto.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
     Optional<Usuario> findByUsuario(String usuario);


 @Modifying
    @Query(value = "DELETE FROM usuarios", nativeQuery = true)
    void vaciarTabla();     
}