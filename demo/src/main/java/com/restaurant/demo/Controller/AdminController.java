package com.restaurant.demo.Controller;

import com.restaurant.demo.Entity.Restaurant;
import com.restaurant.demo.Service.AdminService;
import com.restaurant.demo.Dto.AdminRestaurantRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data) {
        try {
            String usernameOrEmail = data.get("usernameOrEmail");
            String password = data.get("password");

            if (usernameOrEmail == null || password == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Username/email and password are required"));
            }

            return ResponseEntity.ok(adminService.adminLogin(usernameOrEmail, password));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping(value = "/restaurants", consumes = {"multipart/form-data"})
    public ResponseEntity<?> addRestaurant(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("phone") String phone,
            @RequestParam("address") String address,
            @RequestParam("locationLink") String locationLink,
            @RequestParam("budgetRange") String budgetRange,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        try {
            AdminRestaurantRequest request = new AdminRestaurantRequest();
            request.setName(name);
            request.setDescription(description);
            request.setPhone(phone);
            request.setAddress(address);
            request.setLocationLink(locationLink);
            request.setBudgetRange(com.restaurant.demo.enums.BudgetRange.valueOf(budgetRange));
            request.setImage(image);

            Restaurant restaurant = adminService.addRestaurant(request);
            return ResponseEntity.ok(restaurant);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid budget range value"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/restaurants")
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        return ResponseEntity.ok(adminService.getAllRestaurants());
    }
}