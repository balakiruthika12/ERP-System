package com.erp.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT utility — key is initialized ONCE via @PostConstruct after Spring
 * injects all @Value fields, then cached. This guarantees sign == verify.
 *
 * Secret: hex-encoded 256-bit string from application.properties.
 * Expiry: 24 hours by default (app.jwt.expiration in ms).
 */
@Component
public class JwtUtil {

    @Value("${app.jwt.secret:3cfa76ef14937c1c0ea519f8fc057a80fcd04a7420f8e8bcd0a7567c272e007b}")
    private String secretHex;

    @Value("${app.jwt.expiration:86400000}")
    private long expirationMs; // default 24 h

    /** Cached signing key — built once after Spring injects secretHex */
    private Key signingKey;

    @PostConstruct
    public void init() {
        // Decode the hex secret into raw bytes (64 hex chars → 32 bytes = HS256 key)
        String hex = secretHex.trim();
        int len = hex.length();
        byte[] keyBytes = new byte[len / 2];
        for (int i = 0; i < len - 1; i += 2) {
            keyBytes[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    // ─── Public API ───────────────────────────────────────────────────────────

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return buildToken(claims, userDetails.getUsername());
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private String buildToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(signingKey)
                .compact();
    }
}
