package com.restaurant.demo.Service;

import com.restaurant.demo.Entity.*;
import com.restaurant.demo.Repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    public Rating rateRestaurant(Long userId, Long restaurantId, Integer value) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Rating rating = ratingRepository
                .findByUserUserIdAndRestaurantId(userId, restaurantId)
                .orElse(new Rating());

        rating.setUser(user);
        rating.setRestaurant(restaurant);
        rating.setRatingValue(value);

        return ratingRepository.save(rating);
    }

    public List<Rating> getUserRatings(Long userId) {
        return ratingRepository.findByUserUserId(userId);
    }
}