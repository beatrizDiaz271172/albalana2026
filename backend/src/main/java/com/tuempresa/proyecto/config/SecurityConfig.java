package com.tuempresa.proyecto.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Le dice a Spring Security que use la configuración de CorsConfig.java
            .cors(Customizer.withDefaults()) 
            
            // Deshabilita CSRF (indispensable para peticiones POST desde el frontend)
            .csrf(csrf -> csrf.disable()) 
            
            // Configuración de las rutas
            .authorizeHttpRequests(auth -> auth
                // Permite que React acceda al login y registro sin restricciones
                .requestMatchers("/api/auth/**").permitAll() 
                // Cualquier otra ruta requerirá autenticación posterior
                //.anyRequest().authenticated() 
            );

        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
