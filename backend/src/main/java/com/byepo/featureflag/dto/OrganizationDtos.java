package com.byepo.featureflag.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

public class OrganizationDtos {

    @Getter
    @Setter
    public static class CreateRequest {
        @NotBlank(message = "Organization name is required")
        private String name;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private LocalDateTime createdAt;
    }

    /** Lightweight shape used to populate signup dropdowns without exposing timestamps. */
    @Getter
    @Builder
    @AllArgsConstructor
    public static class Summary {
        private Long id;
        private String name;
    }
}
