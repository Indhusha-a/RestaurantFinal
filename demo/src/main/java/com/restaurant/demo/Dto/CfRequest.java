package com.restaurant.demo.Dto;

import lombok.Data;
import java.util.List;

@Data
public class CfRequest {

    private Long userId;
    private List<RatingDTO> ratings;

    @Data
    public static class RatingDTO {
        private Long userId;
        private Long restaurantId;
        private Integer ratingValue;
    }
}