package com.byepo.featureflag.controller;

import com.byepo.featureflag.dto.OrganizationDtos;
import com.byepo.featureflag.service.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    // ---- Super Admin only ----

    @PostMapping("/api/organizations")
    @ResponseStatus(HttpStatus.CREATED)
    public OrganizationDtos.Response create(@Valid @RequestBody OrganizationDtos.CreateRequest request) {
        return organizationService.create(request);
    }

    @GetMapping("/api/organizations")
    public List<OrganizationDtos.Response> listAll() {
        return organizationService.listAll();
    }

    // ---- Public: used by Admin/User signup pages to populate the org dropdown ----

    @GetMapping("/api/organizations/public")
    public List<OrganizationDtos.Summary> listPublic() {
        return organizationService.listPublicSummaries();
    }
}
