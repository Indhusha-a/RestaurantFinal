package com.restaurant.demo.Controller;

import com.restaurant.demo.Entity.Rating;
import com.restaurant.demo.Service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
@CrossOrigin
public class RatingController {

    private final RatingService ratingService;

    @PostMapping
    public Rating rate(
            @RequestParam Long userId,
            @RequestParam Long restaurantId,
            @RequestParam Integer ratingValue) {

        return ratingService.rateRestaurant(userId, restaurantId, ratingValue);
    }
}