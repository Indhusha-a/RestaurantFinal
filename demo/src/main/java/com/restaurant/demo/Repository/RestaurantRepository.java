package com.restaurant.demo.Repository;

import com.restaurant.demo.Entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    Optional<Restaurant> findByEmail(String email);
}