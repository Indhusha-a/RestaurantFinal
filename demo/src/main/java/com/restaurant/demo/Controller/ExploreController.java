package com.restaurant.demo.Controller;

import com.restaurant.demo.Entity.Restaurant;
import com.restaurant.demo.Repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/explore")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Align with other controllers
public class ExploreController {

    private final RestaurantRepository restaurantRepository;

    // Handles the "Top 10 Hot Restuarants" query for Explore Mode
    @GetMapping("/hot")
    public ResponseEntity<?> getHotRestaurants() {
        try {
            List<Restaurant> hot = restaurantRepository.findTop10ByIsApprovedTrueAndIsActiveTrueOrderByPointsDescIdAsc();
            return ResponseEntity.ok(hot);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to load hot restaurants: " + e.getMessage());
        }
    }

    // Handles the "Newly Added" query for Explore Mode
    @GetMapping("/new")
    public ResponseEntity<?> getNewRestaurants() {
        try {
            // Find restaurants approved recently
            List<Restaurant> newRestaurants = restaurantRepository.findByIsApprovedTrueOrderByApprovedAtDesc();
            // In a real scenario, this could be limited to top 15, we'll return all that match for now or just take a sublist if too long
            int limit = Math.min(newRestaurants.size(), 15);
            return ResponseEntity.ok(newRestaurants.subList(0, limit));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to load new restaurants: " + e.getMessage());
        }
    }

    // Fallback or CF integration endpoint for generic "recommended" feed
    @GetMapping("/recommended")
    public ResponseEntity<?> getRecommendedRestaurants() {
        try {
            List<Restaurant> recommended = restaurantRepository.findByIsApprovedTrueAndIsActiveTrue();
            // A simple shuffle for fallback "recommended" feed if CF is not fully driving it
            java.util.Collections.shuffle(recommended);
            int limit = Math.min(recommended.size(), 10);
            return ResponseEntity.ok(recommended.subList(0, limit));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to load recommendations: " + e.getMessage());
        }
    }
}
