package com.byepo.featureflag.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Email/username is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
