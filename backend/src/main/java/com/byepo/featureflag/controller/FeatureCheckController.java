package com.byepo.featureflag.controller;

import com.byepo.featureflag.dto.FeatureFlagDtos;
import com.byepo.featureflag.security.AuthenticatedUser;
import com.byepo.featureflag.service.FeatureFlagService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FeatureCheckController {

    private final FeatureFlagService featureFlagService;

    public FeatureCheckController(FeatureFlagService featureFlagService) {
        this.featureFlagService = featureFlagService;
    }

    @PostMapping("/api/user/check-feature")
    public FeatureFlagDtos.CheckResponse check(
            @AuthenticationPrincipal AuthenticatedUser caller,
            @Valid @RequestBody FeatureFlagDtos.CheckRequest request) {
        return featureFlagService.check(caller.getOrganizationId(), request.getFeatureKey());
    }
}
