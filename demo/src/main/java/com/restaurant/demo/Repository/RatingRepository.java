package com.restaurant.demo.Repository;

import com.restaurant.demo.Entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    Optional<Rating> findByUserUserIdAndRestaurantId(Long userId, Long restaurantId);

    List<Rating> findByUserUserId(Long userId);

    List<Rating> findByRestaurantId(Long restaurantId);
}