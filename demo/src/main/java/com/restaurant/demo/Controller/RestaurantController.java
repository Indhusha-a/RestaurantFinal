package com.restaurant.demo.Controller;

import com.restaurant.demo.Entity.Restaurant;
import com.restaurant.demo.Entity.Speciality;
import com.restaurant.demo.Entity.Tag;
import com.restaurant.demo.Service.RestaurantService;
import com.restaurant.demo.Service.SpecialityService;
import com.restaurant.demo.Service.TagService;
import com.restaurant.demo.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final TagService tagService;
    private final SpecialityService specialityService;
    private final UserService userService;

    // ==================== BASIC CRUD ====================

    @PostMapping
    public Restaurant register(@RequestBody Restaurant restaurant) {
        return restaurantService.registerRestaurant(restaurant);
    }

    @GetMapping
    public List<Restaurant> getAll() {
        return restaurantService.getAllRestaurants();
    }

    @GetMapping("/{id}")
    public Restaurant getById(@PathVariable Long id) {
        return restaurantService.getRestaurantById(id);
    }

    // ==================== INDIVIDUAL MODE - TAG & SPECIALTY ENDPOINTS
    // ====================

    // Proxy for frontend — returns all vibe tags for Individual Mode filter
    @GetMapping("/tags")
    public List<Tag> getAllTags() {
        return tagService.getAllTags();
    }

    // Proxy for frontend — returns all specialties (craving options)
    @GetMapping("/specialties")
    public List<Speciality> getAllSpecialties() {
        return specialityService.getAllSpecialities();
    }

    // ==================== INDIVIDUAL MODE - FILTER, SELECT, RATE
    // ====================

    // Filters restaurants by craving, budget and vibe tags with fallback logic
    @PostMapping("/filter")
    public ResponseEntity<?> filterRestaurants(@RequestBody Map<String, Object> data) {
        try {
            String craving = (String) data.get("craving");
            String budgetRange = (String) data.get("budgetRange");

            @SuppressWarnings("unchecked")
            List<Integer> rawTagIds = (List<Integer>) data.get("tagIds");
            List<Long> tagIds = rawTagIds != null
                    ? rawTagIds.stream().map(Integer::longValue).collect(java.util.stream.Collectors.toList())
                    : null;

            List<Map<String, Object>> results = restaurantService.filterRestaurants(craving, budgetRange, tagIds);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Records user visit and sends notification to restaurant
    @PostMapping("/select")
    public ResponseEntity<?> selectRestaurant(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> data) {
        try {
            Long userId = userService.extractUserId(authHeader);
            Long restaurantId = Long.valueOf(data.get("restaurantId").toString());
            Map<String, Object> result = restaurantService.selectRestaurant(userId, restaurantId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Saves user rating for a restaurant after visiting
    @PostMapping("/rate")
    public ResponseEntity<?> rateRestaurant(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> data) {
        try {
            Long userId = userService.extractUserId(authHeader);
            Long restaurantId = Long.valueOf(data.get("restaurantId").toString());
            Integer ratingValue = Integer.valueOf(data.get("ratingValue").toString());
            Map<String, String> result = restaurantService.rateVisit(userId, restaurantId, ratingValue);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}