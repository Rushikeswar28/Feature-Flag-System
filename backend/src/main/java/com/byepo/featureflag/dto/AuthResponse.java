package com.byepo.featureflag.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String role;
    private String name;
    private String email;
    private Long organizationId;
    private String organizationName;
}
