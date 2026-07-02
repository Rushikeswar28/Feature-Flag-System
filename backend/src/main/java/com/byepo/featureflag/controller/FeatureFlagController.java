package com.byepo.featureflag.controller;

import com.byepo.featureflag.dto.FeatureFlagDtos;
import com.byepo.featureflag.security.AuthenticatedUser;
import com.byepo.featureflag.service.FeatureFlagService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * All endpoints here are restricted to ROLE_ORG_ADMIN (see SecurityConfig)
 * and are always scoped to the caller's own organizationId taken from the
 * JWT - never from a client-supplied parameter. This is what enforces
 * multi-tenant isolation: an Org Admin from Acme Corp can never read or
 * modify Globex Inc's flags, even if they guess a valid flag id.
 */
@RestController
@RequestMapping("/api/flags")
public class FeatureFlagController {

    private final FeatureFlagService featureFlagService;

    public FeatureFlagController(FeatureFlagService featureFlagService) {
        this.featureFlagService = featureFlagService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FeatureFlagDtos.Response create(
            @AuthenticationPrincipal AuthenticatedUser caller,
            @Valid @RequestBody FeatureFlagDtos.CreateRequest request) {
        return featureFlagService.create(caller.getOrganizationId(), request);
    }

    @GetMapping
    public List<FeatureFlagDtos.Response> list(@AuthenticationPrincipal AuthenticatedUser caller) {
        return featureFlagService.listForOrg(caller.getOrganizationId());
    }

    @PutMapping("/{id}")
    public FeatureFlagDtos.Response update(
            @AuthenticationPrincipal AuthenticatedUser caller,
            @PathVariable Long id,
            @RequestBody FeatureFlagDtos.UpdateRequest request) {
        return featureFlagService.update(caller.getOrganizationId(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal AuthenticatedUser caller, @PathVariable Long id) {
        featureFlagService.delete(caller.getOrganizationId(), id);
    }
}
