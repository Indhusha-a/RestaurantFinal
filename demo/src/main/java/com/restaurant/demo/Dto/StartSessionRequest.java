package com.restaurant.demo.Dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StartSessionRequest {
    private Long groupId;
    private Long createdByUserId;
}