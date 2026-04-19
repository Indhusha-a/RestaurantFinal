package com.restaurant.demo.Dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoteRequest {
    private Long sessionId;
    private Long userId;
    private Long restaurantId;
    private Boolean isLiked;
}