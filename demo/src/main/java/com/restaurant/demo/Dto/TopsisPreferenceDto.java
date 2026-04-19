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
public class TopsisPreferenceDto {
    private Long user_id;
    private String craving;
    private String budget_preference;
    private List<Long> tag_ids;
}