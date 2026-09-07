package com.tuempresa.proyecto.controllers;

import com.tuempresa.proyecto.dtos.QuesoDTO;
import com.tuempresa.proyecto.services.QuesoService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController

public class QuesoController {

    private final QuesoService quesoService;

    public QuesoController(QuesoService quesoService) {
        this.quesoService = quesoService;
    }

    @GetMapping("/api/quesos")
    public List<QuesoDTO> listarQuesos(@RequestParam(defaultValue = "10") int limite) {
        return quesoService.obtenerQuesosEnEspanol(limite);
    }
}
