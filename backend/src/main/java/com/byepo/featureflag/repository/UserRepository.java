package com.byepo.featureflag.repository;

import com.byepo.featureflag.entity.Role;
import com.byepo.featureflag.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCaseAndRole(String email, Role role);
    boolean existsByEmailIgnoreCase(String email);
}
