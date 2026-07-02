package com.byepo.featureflag.controller;

import com.byepo.featureflag.dto.AuthResponse;
import com.byepo.featureflag.dto.LoginRequest;
import com.byepo.featureflag.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/super-admin")
public class SuperAdminAuthController {

    private final AuthService authService;

    public SuperAdminAuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.superAdminLogin(request);
    }
}
