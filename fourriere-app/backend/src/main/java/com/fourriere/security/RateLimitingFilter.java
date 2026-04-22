package com.fourriere.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fourriere.dto.response.ErrorResponse;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Rate limiter basé sur l'IP client.
 *
 * - Cache Caffeine avec éviction (expireAfterAccess 10 min) → pas de fuite mémoire
 * - Trust de X-Forwarded-For uniquement depuis les proxies configurés (liste CSV
 *   dans rate-limit.trusted-proxies, par défaut vide = pas de confiance).
 * - Endpoints protégés :
 *     /api/auth/*            → 5 req/min/IP
 *     /api/vehicules/recherche → 30 req/min/IP
 *     /api/vehicules/{id}    → 30 req/min/IP (anti-énumération)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;

    @Value("${rate-limit.trusted-proxies:}")
    private String trustedProxiesCsv;

    @Value("${rate-limit.auth-per-minute:5}")
    private int authLimit;

    @Value("${rate-limit.search-per-minute:30}")
    private int searchLimit;

    @Value("${rate-limit.detail-per-minute:30}")
    private int detailLimit;

    private List<String> trustedProxies = Collections.emptyList();

    private final Cache<String, Bucket> authBuckets = Caffeine.newBuilder()
            .expireAfterAccess(Duration.ofMinutes(10))
            .maximumSize(100_000)
            .build();

    private final Cache<String, Bucket> searchBuckets = Caffeine.newBuilder()
            .expireAfterAccess(Duration.ofMinutes(10))
            .maximumSize(100_000)
            .build();

    private final Cache<String, Bucket> detailBuckets = Caffeine.newBuilder()
            .expireAfterAccess(Duration.ofMinutes(10))
            .maximumSize(100_000)
            .build();

    @PostConstruct
    void init() {
        if (trustedProxiesCsv != null && !trustedProxiesCsv.isBlank()) {
            trustedProxies = new ArrayList<>(Arrays.asList(trustedProxiesCsv.split(",")));
            trustedProxies.replaceAll(String::trim);
            trustedProxies.removeIf(String::isBlank);
        }
        log.info("Rate limiter : trusted proxies = {}, limits = auth:{}/min search:{}/min detail:{}/min",
                trustedProxies, authLimit, searchLimit, detailLimit);
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getRequestURI();
        String clientIp = getClientIp(request);

        if (path.startsWith("/api/auth/")) {
            if (!tryConsume(authBuckets, clientIp, authLimit)) {
                sendRateLimitResponse(response, request, "Trop de tentatives. Réessayez dans une minute.");
                return;
            }
        } else if ("/api/vehicules/recherche".equals(path)) {
            if (!tryConsume(searchBuckets, clientIp, searchLimit)) {
                sendRateLimitResponse(response, request, "Trop de recherches. Réessayez dans une minute.");
                return;
            }
        } else if (path.startsWith("/api/vehicules/") && "GET".equals(request.getMethod())
                && !path.equals("/api/vehicules/recherche")) {
            // Protection anti-énumération sur GET /api/vehicules/{id}
            if (!tryConsume(detailBuckets, clientIp, detailLimit)) {
                sendRateLimitResponse(response, request, "Trop de requêtes. Réessayez dans une minute.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean tryConsume(Cache<String, Bucket> cache, String key, int limitPerMinute) {
        Bucket bucket = cache.get(key, k -> createBucket(limitPerMinute));
        return bucket != null && bucket.tryConsume(1);
    }

    private Bucket createBucket(int limitPerMinute) {
        Bandwidth limit = Bandwidth.classic(limitPerMinute,
                Refill.intervally(limitPerMinute, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    /**
     * Résolution IP client avec trust strict du header X-Forwarded-For
     * uniquement si l'IP directe (remote addr) est dans la liste des proxies
     * de confiance. Sinon on ignore complètement le header.
     */
    private String getClientIp(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();
        if (trustedProxies.isEmpty() || !trustedProxies.contains(remoteAddr)) {
            return remoteAddr;
        }
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return remoteAddr;
    }

    private void sendRateLimitResponse(HttpServletResponse response, HttpServletRequest request, String message)
            throws IOException {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.TOO_MANY_REQUESTS.value())
                .error("Too Many Requests")
                .message(message)
                .path(request.getRequestURI())
                .build();

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), errorResponse);
    }
}
