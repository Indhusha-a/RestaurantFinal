package com.restaurant.demo.Dto;

import lombok.Data;
import java.util.List;

@Data
public class CfResponse {
    private List<Long> recommendedRestaurantIds;
}