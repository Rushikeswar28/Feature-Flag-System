package com.byepo.featureflag.service;

import com.byepo.featureflag.dto.AuthResponse;
import com.byepo.featureflag.dto.LoginRequest;
import com.byepo.featureflag.dto.SignupRequest;
import com.byepo.featureflag.entity.Organization;
import com.byepo.featureflag.entity.Role;
import com.byepo.featureflag.entity.User;
import com.byepo.featureflag.exception.ApiException;
import com.byepo.featureflag.repository.OrganizationRepository;
import com.byepo.featureflag.repository.UserRepository;
import com.byepo.featureflag.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private final String superAdminUsername;
    private final String superAdminPassword;

    public AuthService(
            UserRepository userRepository,
            OrganizationRepository organizationRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            @Value("${app.super-admin.username}") String superAdminUsername,
            @Value("${app.super-admin.password}") String superAdminPassword) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.superAdminUsername = superAdminUsername;
        this.superAdminPassword = superAdminPassword;
    }

    /**
     * Super Admin uses static, config-based credentials (app.super-admin.*
     * in application.properties) - by design there is no DB row, no signup
     * flow, and no third-party identity provider involved.
     */
    public AuthResponse superAdminLogin(LoginRequest request) {
        if (!superAdminUsername.equals(request.getEmail()) || !superAdminPassword.equals(request.getPassword())) {
            throw ApiException.unauthorized("Invalid super admin credentials");
        }

        String token = jwtUtil.generateToken("superadmin", "SUPER_ADMIN", null, null);

        return AuthResponse.builder()
                .token(token)
                .role("SUPER_ADMIN")
                .name("Super Admin")
                .email(superAdminUsername)
                .build();
    }

    @Transactional
    public AuthResponse signup(SignupRequest request, Role role) {
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw ApiException.conflict("An account with this email already exists");
        }

        Organization org = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> ApiException.badRequest("Selected organization does not exist"));

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .organization(org)
                .build();

        user = userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request, Role role) {
        User user = userRepository.findByEmailIgnoreCaseAndRole(request.getEmail(), role)
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw ApiException.unauthorized("Invalid email or password");
        }

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name(), user.getOrganization().getId(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .name(user.getName())
                .email(user.getEmail())
                .organizationId(user.getOrganization().getId())
                .organizationName(user.getOrganization().getName())
                .build();
    }
}
