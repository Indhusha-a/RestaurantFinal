package com.restaurant.demo.Dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmitPreferenceRequest {
    private Long sessionId;
    private Long userId;
    private String craving;
    private String budgetRange;
    private List<Long> tagIds; // maximum 3
}
