package com.restaurant.demo.Dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserSearchResponse {
    private Long userId;
    private String username;
    private String firstName;
    private String lastName;
}