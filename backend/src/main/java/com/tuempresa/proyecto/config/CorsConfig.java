package com.tuempresa.proyecto.config; // Asegurate de que coincida con tu estructura de paquetes

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
    

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Aplica a todos los endpoints del backend
                        .allowedOrigins(
                             "http://localhost:3000",
                        "http://localhost:5173",
                        "http://192.168.0.32:5173",
                        "http://localhost",                              // Postman
                        "https://albalana2026-production.up.railway.app",    
                        "ionic://localhost",              // Capacitor
                        "capacitor://localhost"           // Capacitor          // Capacitor
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .allowCredentials(true);
                
            }
        };
    }
}
     "http://localhost:3000",
                        "http://localhost:5173",
                        "http://192.168.0.32:5173",
                        "http://localhost",                              // Postman
                        "https://albalana2026-production.up.railway.app"