package com.restaurant.demo.Dto;

import com.restaurant.demo.enums.BudgetRange;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class AdminRestaurantRequest {
    private String name;
    private String description;
    private String phone;
    private String address;
    private String locationLink;
    private BudgetRange budgetRange;
    private MultipartFile image;
}