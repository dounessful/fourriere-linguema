package com.fourriere.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Optional;

@Configuration
public class AuditingConfig {

    @Bean
    public AuditorAware<String> auditorAware() {
        return () -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return Optional.of("system");
            }
            Object principal = auth.getPrincipal();
            if (principal instanceof Jwt jwt) {
                String username = jwt.getClaimAsString("preferred_username");
                if (username == null || username.isBlank()) {
                    username = jwt.getClaimAsString("email");
                }
                if (username == null || username.isBlank()) {
                    username = jwt.getSubject();
                }
                return Optional.ofNullable(username);
            }
            return Optional.ofNullable(auth.getName());
        };
    }
}
