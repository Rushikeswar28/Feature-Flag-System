package com.byepo.featureflag.entity;

/**
 * Roles persisted in the database.
 *
 * SUPER_ADMIN is intentionally excluded here: per the assignment, the Super
 * Admin uses static, config-based credentials and is never stored as a row
 * in the users table. It is represented purely as a claim in the issued JWT.
 */
public enum Role {
    ORG_ADMIN,
    END_USER
}
