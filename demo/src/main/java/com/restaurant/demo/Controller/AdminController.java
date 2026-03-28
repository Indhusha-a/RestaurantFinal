package com.restaurant.demo.Controller;

import com.restaurant.demo.Dto.AdminRestaurantRequest;
import com.restaurant.demo.Entity.Restaurant;
import com.restaurant.demo.Service.AdminService;
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

    // =========================
    // ADMIN LOGIN
    // =========================
    // This endpoint allows only admin users to log in.
    // Admin can use either username or email with password.
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data) {
        try {
            String usernameOrEmail = data.get("usernameOrEmail");
            String password = data.get("password");

            // Basic validation before checking the database
            if (usernameOrEmail == null || password == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Username/email and password are required"));
            }

            return ResponseEntity.ok(adminService.adminLogin(usernameOrEmail, password));

        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    // =========================
    // ADMIN MANUAL ADD RESTAURANT
    // =========================
    // This is used when admin manually adds a restaurant to the system.
    // Image is optional here.
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

    // =========================
    // RESTAURANT MANAGEMENT
    // =========================

    // Returns all restaurants for manage-restaurants page
    @GetMapping("/restaurants")
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        return ResponseEntity.ok(adminService.getAllRestaurants());
    }

    // Returns only restaurants that are still waiting for approval
    @GetMapping("/restaurants/pending")
    public ResponseEntity<List<Restaurant>> getPendingRestaurants() {
        return ResponseEntity.ok(adminService.getPendingRestaurants());
    }

    // Returns rejected restaurants separately
    // Useful if you want a separate rejected-restaurants table in frontend
    @GetMapping("/restaurants/rejected")
    public ResponseEntity<List<Restaurant>> getRejectedRestaurants() {
        return ResponseEntity.ok(adminService.getRejectedRestaurants());
    }

    // Approve restaurant
    @PutMapping("/restaurants/{id}/approve")
    public ResponseEntity<?> approveRestaurant(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.approveRestaurant(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Reject restaurant with a reason
    // We are not deleting it anymore. We keep the record for future reference.
    @PostMapping("/restaurants/{id}/reject")
    public ResponseEntity<?> rejectRestaurant(
            @PathVariable Long id,
            @RequestBody Map<String, String> data
    ) {
        try {
            String reason = data.get("reason");

            // Rejection reason should not be empty
            if (reason == null || reason.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Rejection reason is required"));
            }

            Restaurant rejectedRestaurant = adminService.rejectRestaurant(id, reason);

            return ResponseEntity.ok(Map.of(
                    "message", "Restaurant rejected successfully",
                    "restaurant", rejectedRestaurant
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // =========================
    // USER MANAGEMENT (LIMITED)
    // =========================

    // Admin can view only limited user details
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsersLimited() {
        return ResponseEntity.ok(adminService.getAllUsersLimited());
    }

    // Shows users who asked to delete their account
    @GetMapping("/users/deletion-requests")
    public ResponseEntity<?> getDeletionRequests() {
        return ResponseEntity.ok(adminService.getDeletionRequests());
    }

    // Permanently remove a user after admin approval
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> approveUserDeletion(@PathVariable Long id) {
        try {
            adminService.approveUserDeletion(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // =========================
    // DASHBOARD STATS
    // =========================

    // Returns summary values used in admin dashboard cards/charts
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }
}