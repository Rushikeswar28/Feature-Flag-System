package com.byepo.featureflag.service;

import com.byepo.featureflag.dto.FeatureFlagDtos;
import com.byepo.featureflag.entity.FeatureFlag;
import com.byepo.featureflag.entity.Organization;
import com.byepo.featureflag.exception.ApiException;
import com.byepo.featureflag.repository.FeatureFlagRepository;
import com.byepo.featureflag.repository.OrganizationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeatureFlagService {

    private final FeatureFlagRepository featureFlagRepository;
    private final OrganizationRepository organizationRepository;

    public FeatureFlagService(FeatureFlagRepository featureFlagRepository, OrganizationRepository organizationRepository) {
        this.featureFlagRepository = featureFlagRepository;
        this.organizationRepository = organizationRepository;
    }

    public FeatureFlagDtos.Response create(Long organizationId, FeatureFlagDtos.CreateRequest request) {
        String key = request.getFeatureKey().trim();

        if (featureFlagRepository.existsByOrganizationIdAndFeatureKeyIgnoreCase(organizationId, key)) {
            throw ApiException.conflict("A feature flag with this key already exists for your organization");
        }

        Organization org = organizationRepository.getReferenceById(organizationId);

        FeatureFlag flag = FeatureFlag.builder()
                .featureKey(key)
                .enabled(request.isEnabled())
                .organization(org)
                .build();

        flag = featureFlagRepository.save(flag);
        return toResponse(flag);
    }

    public List<FeatureFlagDtos.Response> listForOrg(Long organizationId) {
        return featureFlagRepository.findByOrganizationId(organizationId).stream()
                .map(this::toResponse)
                .toList();
    }

    public FeatureFlagDtos.Response update(Long organizationId, Long flagId, FeatureFlagDtos.UpdateRequest request) {
        FeatureFlag flag = featureFlagRepository.findByIdAndOrganizationId(flagId, organizationId)
                .orElseThrow(() -> ApiException.notFound("Feature flag not found"));

        if (request.getFeatureKey() != null && !request.getFeatureKey().isBlank()) {
            String newKey = request.getFeatureKey().trim();
            boolean clash = featureFlagRepository
                    .findByOrganizationIdAndFeatureKeyIgnoreCase(organizationId, newKey)
                    .filter(existing -> !existing.getId().equals(flagId))
                    .isPresent();
            if (clash) {
                throw ApiException.conflict("Another feature flag already uses this key");
            }
            flag.setFeatureKey(newKey);
        }

        if (request.getEnabled() != null) {
            flag.setEnabled(request.getEnabled());
        }

        flag = featureFlagRepository.save(flag);
        return toResponse(flag);
    }

    public void delete(Long organizationId, Long flagId) {
        FeatureFlag flag = featureFlagRepository.findByIdAndOrganizationId(flagId, organizationId)
                .orElseThrow(() -> ApiException.notFound("Feature flag not found"));
        featureFlagRepository.delete(flag);
    }

    /** Used by the End User "check feature" flow. Missing flags are reported as found=false rather than 404,
     *  since "flag doesn't exist" and "flag exists but disabled" are both meaningful, distinct answers. */
    public FeatureFlagDtos.CheckResponse check(Long organizationId, String featureKey) {
        return featureFlagRepository.findByOrganizationIdAndFeatureKeyIgnoreCase(organizationId, featureKey.trim())
                .map(flag -> FeatureFlagDtos.CheckResponse.builder()
                        .featureKey(flag.getFeatureKey())
                        .enabled(flag.isEnabled())
                        .found(true)
                        .build())
                .orElse(FeatureFlagDtos.CheckResponse.builder()
                        .featureKey(featureKey)
                        .enabled(false)
                        .found(false)
                        .build());
    }

    private FeatureFlagDtos.Response toResponse(FeatureFlag flag) {
        return FeatureFlagDtos.Response.builder()
                .id(flag.getId())
                .featureKey(flag.getFeatureKey())
                .enabled(flag.isEnabled())
                .createdAt(flag.getCreatedAt())
                .updatedAt(flag.getUpdatedAt())
                .build();
    }
}
