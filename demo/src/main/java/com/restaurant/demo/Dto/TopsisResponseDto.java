package com.restaurant.demo.Dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TopsisResponseDto {
    private Boolean success;
    private Long session_id;
    private List<TopsisRankedRestaurantDto> results;
    private String message;
}