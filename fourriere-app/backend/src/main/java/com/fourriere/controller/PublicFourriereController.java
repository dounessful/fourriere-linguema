package com.fourriere.controller;

import com.fourriere.dto.response.FourriereResponse;
import com.fourriere.service.FourriereService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/fourrieres")
@RequiredArgsConstructor
@Tag(name = "Fourrières (public)", description = "Liste publique des fourrières actives")
public class PublicFourriereController {

    private final FourriereService fourriereService;

    @GetMapping("/active")
    @Operation(summary = "Lister les fourrières actives (public)")
    public ResponseEntity<List<FourriereResponse>> findAllActive() {
        return ResponseEntity.ok(fourriereService.findAllActive());
    }
}
