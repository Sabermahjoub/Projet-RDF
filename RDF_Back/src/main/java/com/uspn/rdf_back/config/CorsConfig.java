package com.uspn.rdf_back.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * Configuration CORS pour autoriser les requêtes du frontend Angular (localhost:4200)
 * et de l'application Electron (file://)
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Origines autorisées : Angular dev server + Electron
        config.addAllowedOrigin("http://localhost:4200");
        config.addAllowedOrigin("http://localhost:4000");
        config.addAllowedOrigin("file://");  // Pour Electron

        // Méthodes HTTP autorisées
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");

        // Headers autorisés
        config.addAllowedHeader("*");

        // Autoriser les credentials
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        source.registerCorsConfiguration("/**", config);   // fallback

        return new CorsFilter(source);
    }
}
