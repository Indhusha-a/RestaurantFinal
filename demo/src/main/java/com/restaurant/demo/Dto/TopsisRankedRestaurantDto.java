package com.restaurant.demo.Dto;

import java.util.List;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TopsisRankedRestaurantDto {
    private Long restaurant_id;
    private Double topsis_score;
    private Integer rank;
    private Double group_match_percentage;
    private List<Map<String, Object>> member_scores;
}