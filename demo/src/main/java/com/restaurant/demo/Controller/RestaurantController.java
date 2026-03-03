package com.restaurant.demo.Controller;

import com.restaurant.demo.Entity.Restaurant;
import com.restaurant.demo.Service.RestaurantService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin
public class RestaurantController {

    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    // Register new restaurant
    @PostMapping
    public Restaurant register(@RequestBody Restaurant restaurant) {
        return restaurantService.registerRestaurant(restaurant);
    }

    // Get all restaurants
    @GetMapping
    public List<Restaurant> getAll() {
        return restaurantService.getAllRestaurants();
    }

    // Get by ID
    @GetMapping("/{id}")
    public Restaurant getById(@PathVariable Long id) {
        return restaurantService.getRestaurantById(id);
    }
}