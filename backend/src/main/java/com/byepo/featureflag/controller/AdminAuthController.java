package com.byepo.featureflag.controller;

import com.byepo.featureflag.dto.AuthResponse;
import com.byepo.featureflag.dto.LoginRequest;
import com.byepo.featureflag.dto.SignupRequest;
import com.byepo.featureflag.entity.Role;
import com.byepo.featureflag.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    private final AuthService authService;

    public AdminAuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request, Role.ORG_ADMIN);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request, Role.ORG_ADMIN);
    }
}
