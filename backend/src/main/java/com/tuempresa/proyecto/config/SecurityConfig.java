package com.tuempresa.proyecto.config;

import com.tuempresa.proyecto.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Le dice a Spring Security que use la configuración de CorsConfig.java
            .cors(Customizer.withDefaults())

            // Deshabilita CSRF (indispensable para peticiones POST desde el frontend)
            .csrf(csrf -> csrf.disable())

            // Sin sesiones de servidor: cada request se autentica solo con el JWT
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Configuración de las rutas
            .authorizeHttpRequests(auth -> auth
                // Permite que React acceda al login y registro sin restricciones
                .requestMatchers("/api/auth/**").permitAll()
                // Cualquier otra ruta requerirá un JWT válido
                .anyRequest().authenticated()
            )

            // Nuestro filtro corre antes del filtro estándar de usuario/contraseña
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
