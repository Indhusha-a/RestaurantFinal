package com.restaurant.demo.Dto;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TopsisRequestDto {
    private Long session_id;
    private List<TopsisPreferenceDto> preferences;
    private List<TopsisRestaurantDto> restaurants;
    private Map<String, Double> weights;
    private Map<String, String> criteria_types;
}