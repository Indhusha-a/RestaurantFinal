package com.restaurant.demo.Dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InviteUserByUsernameRequest {
    private Long groupId;
    private Long invitedByUserId;
    private String invitedUsername;
}