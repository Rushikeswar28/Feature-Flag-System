package com.byepo.featureflag.repository;

import com.byepo.featureflag.entity.FeatureFlag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FeatureFlagRepository extends JpaRepository<FeatureFlag, Long> {

    List<FeatureFlag> findByOrganizationId(Long organizationId);

    Optional<FeatureFlag> findByIdAndOrganizationId(Long id, Long organizationId);

    Optional<FeatureFlag> findByOrganizationIdAndFeatureKeyIgnoreCase(Long organizationId, String featureKey);

    boolean existsByOrganizationIdAndFeatureKeyIgnoreCase(Long organizationId, String featureKey);
}
