package com.restaurant.demo.Dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RespondInvitationRequest {
    private Long invitationId;
    private String action; // ACCEPT or REJECT
}