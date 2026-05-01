package com.scholarhub.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final SecretKey signingKey;
  private final long expirationMs;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.expiration-ms}") long expirationMs) {
    this.signingKey = buildSigningKey(secret);
    this.expirationMs = expirationMs;
  }

  public String generateToken(UserPrincipal userPrincipal) {
    return Jwts.builder()
        .claims(Map.of("role", userPrincipal.getRole().name(), "userId", userPrincipal.getId()))
        .subject(userPrincipal.getUsername())
        .issuedAt(Date.from(Instant.now()))
        .expiration(Date.from(expiresAt()))
        .signWith(signingKey)
        .compact();
  }

  public Instant expiresAt() {
    return Instant.now().plusMillis(expirationMs);
  }

  public String extractUsername(String token) {
    return extractAllClaims(token).getSubject();
  }

  public boolean isTokenValid(String token, UserDetails userDetails) {
    Claims claims = extractAllClaims(token);
    return claims.getSubject().equals(userDetails.getUsername())
        && claims.getExpiration().after(new Date());
  }

  private Claims extractAllClaims(String token) {
    return Jwts.parser()
        .verifyWith(signingKey)
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  private SecretKey buildSigningKey(String secret) {
    return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }
}
