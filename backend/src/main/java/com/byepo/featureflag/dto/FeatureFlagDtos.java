package com.byepo.featureflag.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

public class FeatureFlagDtos {

    @Getter
    @Setter
    public static class CreateRequest {
        @NotBlank(message = "Feature key is required")
        private String featureKey;

        /** Defaults to false (disabled) when omitted. */
        private boolean enabled;
    }

    @Getter
    @Setter
    public static class UpdateRequest {
        /** Either field may be null - only non-null fields are applied (partial update). */
        private String featureKey;
        private Boolean enabled;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String featureKey;
        private boolean enabled;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Getter
    @Setter
    public static class CheckRequest {
        @NotBlank(message = "Feature key is required")
        private String featureKey;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class CheckResponse {
        private String featureKey;
        private boolean enabled;
        private boolean found;
    }
}
