package com.byepo.featureflag.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Represents the caller identity extracted from a validated JWT. Stored as
 * the principal on the Spring Security Authentication so controllers can
 * pull it out via @AuthenticationPrincipal.
 */
@Getter
@AllArgsConstructor
public class AuthenticatedUser {
    private final String subject;      // email, or "superadmin" for the static Super Admin
    private final String role;         // SUPER_ADMIN | ORG_ADMIN | END_USER
    private final Long organizationId; // null for SUPER_ADMIN
    private final Long userId;         // null for SUPER_ADMIN
}
