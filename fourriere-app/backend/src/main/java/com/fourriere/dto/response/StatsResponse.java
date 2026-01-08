package com.fourriere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {
    private long totalVehicules;
    private long vehiculesEnCours;
    private long vehiculesRecuperesCeMois;
}
