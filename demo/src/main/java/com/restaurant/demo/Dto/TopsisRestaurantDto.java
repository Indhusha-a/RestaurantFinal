package com.restaurant.demo.Dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TopsisRestaurantDto {
    private Long restaurant_id;
    private String name;
    private String budget_range;
    private List<Long> tag_ids;
    private List<String> specialties;
}