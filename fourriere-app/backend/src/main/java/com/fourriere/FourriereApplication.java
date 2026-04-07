package com.fourriere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class FourriereApplication {

    public static void main(String[] args) {
        SpringApplication.run(FourriereApplication.class, args);
    }
}
