package com.byepo.featureflag.service;

import com.byepo.featureflag.dto.OrganizationDtos;
import com.byepo.featureflag.entity.Organization;
import com.byepo.featureflag.exception.ApiException;
import com.byepo.featureflag.repository.OrganizationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    public OrganizationService(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    public OrganizationDtos.Response create(OrganizationDtos.CreateRequest request) {
        if (organizationRepository.existsByNameIgnoreCase(request.getName())) {
            throw ApiException.conflict("An organization with this name already exists");
        }

        Organization org = Organization.builder()
                .name(request.getName().trim())
                .build();

        org = organizationRepository.save(org);
        return toResponse(org);
    }

    public List<OrganizationDtos.Response> listAll() {
        return organizationRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    /** Public, lightweight listing used to populate signup dropdowns (no auth required). */
    public List<OrganizationDtos.Summary> listPublicSummaries() {
        return organizationRepository.findAll().stream()
                .map(o -> OrganizationDtos.Summary.builder().id(o.getId()).name(o.getName()).build())
                .toList();
    }

    private OrganizationDtos.Response toResponse(Organization org) {
        return OrganizationDtos.Response.builder()
                .id(org.getId())
                .name(org.getName())
                .createdAt(org.getCreatedAt())
                .build();
    }
}
