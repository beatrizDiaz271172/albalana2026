package com.tuempresa.proyecto.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/red")
public class RedController {

    @GetMapping("/info")
    public ResponseEntity<Map<String, String>> getRedInfo() {
        Map<String, String> info = new HashMap<>();
        try {
            InetAddress ip = InetAddress.getLocalHost();
            info.put("nombreEquipo", ip.getHostName());
            info.put("ipLocal", ip.getHostAddress());
            info.put("puerto", "5173");
            info.put("escuchandoEn", "0.0.0.0 (todas las interfaces)");
            return ResponseEntity.ok(info);
        } catch (UnknownHostException e) {
            info.put("ipLocal", "192.168.0.75");
            info.put("nombreEquipo", "localhost");
            info.put("puerto", "5001");
            return ResponseEntity.ok(info);
        }
    }
}