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
@RequestMapping("/api/user")
public class UserAuthController {

    private final AuthService authService;

    public UserAuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request, Role.END_USER);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request, Role.END_USER);
    }
}
