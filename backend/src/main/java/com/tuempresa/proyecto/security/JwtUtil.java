package com.tuempresa.proyecto.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    // Clave secreta para firmar los tokens. Se lee de application.properties.
    @Value("${jwt.secret}")
    private String secret;

    // Tiempo de expiración del token en milisegundos (default 24hs).
    @Value("${jwt.expiration-ms:86400000}")
    private long expirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Genera un token firmado para el usuario que inició sesión.
    public String generarToken(String usuario) {
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + expirationMs);

        return Jwts.builder()
                .subject(usuario)
                .issuedAt(ahora)
                .expiration(expiracion)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extraerUsuario(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    public Date extraerExpiracion(String token) {
        return extraerClaim(token, Claims::getExpiration);
    }

    private <T> T extraerClaim(String token, Function<Claims, T> resolver) {
        Claims claims = extraerTodosLosClaims(token);
        return resolver.apply(claims);
    }

    private Claims extraerTodosLosClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean esTokenValido(String token, String usuario) {
        final String usuarioDelToken = extraerUsuario(token);
        return usuarioDelToken.equals(usuario) && !esTokenExpirado(token);
    }

    private boolean esTokenExpirado(String token) {
        return extraerExpiracion(token).before(new Date());
    }
}
