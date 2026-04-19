package com.restaurant.demo.Dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateGroupRequest {
    private String groupName;
    private Long createdByUserId;
}