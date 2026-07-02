package com.byepo.featureflag.repository;

import com.byepo.featureflag.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    boolean existsByNameIgnoreCase(String name);
    Optional<Organization> findByNameIgnoreCase(String name);
}
