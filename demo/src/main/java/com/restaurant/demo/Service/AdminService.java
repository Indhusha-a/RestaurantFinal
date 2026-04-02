package com.restaurant.demo.Service;

import com.restaurant.demo.Dto.AdminRestaurantRequest;
import com.restaurant.demo.Entity.Restaurant;
import com.restaurant.demo.Entity.User;
import com.restaurant.demo.Repository.RestaurantRepository;
import com.restaurant.demo.Repository.UserRepository;
import com.restaurant.demo.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;

    // =========================
    // ADMIN LOGIN
    // =========================
    // This method checks whether the given username/email belongs to an admin,
    // then validates the password and returns basic login details.
    public Map<String, Object> adminLogin(String usernameOrEmail, String password) {
        Optional<User> optionalUser =
                userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);

        if (optionalUser.isEmpty()) {
            throw new RuntimeException("Admin account not found");
        }

        User user = optionalUser.get();

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password");
        }

        if (user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Access denied. Not an admin account");
        }

        if (!user.getIsActive()) {
            throw new RuntimeException("Admin account is deactivated");
        }

        // Very simple token just for current project flow
        String token = Base64.getEncoder()
                .encodeToString(("user:" + user.getUserId()).getBytes());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", token);
        response.put("userId", user.getUserId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("role", user.getRole().name());
        response.put("message", "Admin login successful");

        return response;
    }

    // =========================
    // ADMIN MANUAL ADD RESTAURANT
    // =========================
    // This is used when admin manually adds a restaurant to the system.
    // Since admin is the one adding it, we directly mark it as APPROVED.
    public Restaurant addRestaurant(AdminRestaurantRequest request) {
        String savedImagePath = saveImage(request.getImage());

        Restaurant restaurant = Restaurant.builder()
                .name(request.getName())
                .description(request.getDescription())
                .phone(request.getPhone())
                .address(request.getAddress())
                .locationLink(request.getLocationLink())
                .budgetRange(request.getBudgetRange())
                .image1Path(savedImagePath)
                .isApproved(true)
                .isActive(true)
                .points(0)
                .boostRequested(false)
                .status("APPROVED")              // admin-added restaurant goes directly live
                .rejectionReason(null)           // no rejection reason because it is approved
                .approvedAt(LocalDateTime.now())
                .build();

        return restaurantRepository.save(restaurant);
    }

    // =========================
    // RESTAURANT MANAGEMENT
    // =========================

    // Returns all restaurants for manage-restaurants page
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAllByOrderByIdDesc();
    }

    // Returns only restaurants waiting for admin action
    public List<Restaurant> getPendingRestaurants() {
        return restaurantRepository.findAll()
                .stream()
                .filter(restaurant -> "PENDING".equalsIgnoreCase(restaurant.getStatus()))
                .sorted(Comparator.comparing(Restaurant::getId).reversed())
                .toList();
    }

    // Approves a pending restaurant
    public Restaurant approveRestaurant(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        // Mark this restaurant as approved
        restaurant.setIsApproved(true);

        // Update workflow status
        restaurant.setStatus("APPROVED");

        // Clear old rejection reason if there was one before
        restaurant.setRejectionReason(null);

        // Save the approval date
        restaurant.setApprovedAt(LocalDateTime.now());

        return restaurantRepository.save(restaurant);
    }

    // Rejects a restaurant but keeps the record in database
    // This is better than hard delete because admin can keep rejection history.
    public Restaurant rejectRestaurant(Long restaurantId, String reason) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        // When rejected, it should not be treated as approved
        restaurant.setIsApproved(false);

        // Set status as rejected
        restaurant.setStatus("REJECTED");

        // Save the reason entered by admin
        restaurant.setRejectionReason(reason);

        // Clear approval date because it was not approved
        restaurant.setApprovedAt(null);

        return restaurantRepository.save(restaurant);
    }

    // Optional helper if later you want a separate rejected-restaurants page
    public List<Restaurant> getRejectedRestaurants() {
        return restaurantRepository.findAll()
                .stream()
                .filter(restaurant -> "REJECTED".equalsIgnoreCase(restaurant.getStatus()))
                .sorted(Comparator.comparing(Restaurant::getId).reversed())
                .toList();
    }

    // =========================
    // USER MANAGEMENT (LIMITED)
    // =========================

    // Admin can only view limited details of normal users
    public List<Map<String, Object>> getAllUsersLimited() {
        List<User> users = userRepository.findByIsActiveTrue();
        List<Map<String, Object>> result = new ArrayList<>();

        for (User user : users) {
            if (user.getRole() == Role.USER) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("userId", user.getUserId());
                row.put("username", user.getUsername());
                row.put("isActive", user.getIsActive());
                row.put("deletionRequested", user.getDeletionRequested());
                result.add(row);
            }
        }

        return result;
    }

    // Returns only users who requested account deletion
    public List<Map<String, Object>> getDeletionRequests() {
        List<User> users = userRepository.findByDeletionRequestedTrue();
        List<Map<String, Object>> result = new ArrayList<>();

        for (User user : users) {
            if (user.getRole() == Role.USER) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("userId", user.getUserId());
                row.put("username", user.getUsername());
                row.put("deletionRequested", user.getDeletionRequested());
                result.add(row);
            }
        }

        return result;
    }

    // Permanently deletes a normal user after admin approval
    public void approveUserDeletion(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.USER) {
            throw new RuntimeException("Only normal users can be deleted from this section");
        }

        userRepository.delete(user);
    }

    // =========================
    // DASHBOARD STATS
    // =========================

    // Returns card values for admin dashboard
    public Map<String, Object> getDashboardStats() {
        long totalUsers = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.USER)
                .count();

        long activeUsers = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.USER && Boolean.TRUE.equals(user.getIsActive()))
                .count();

        long totalRestaurants = restaurantRepository.count();

        // Using status here is more accurate than only using isApproved
        long pendingRestaurants = restaurantRepository.findAll().stream()
                .filter(restaurant -> "PENDING".equalsIgnoreCase(restaurant.getStatus()))
                .count();

        long approvedRestaurants = restaurantRepository.findAll().stream()
                .filter(restaurant -> "APPROVED".equalsIgnoreCase(restaurant.getStatus()))
                .count();

        long rejectedRestaurants = restaurantRepository.findAll().stream()
                .filter(restaurant -> "REJECTED".equalsIgnoreCase(restaurant.getStatus()))
                .count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("totalRestaurants", totalRestaurants);
        stats.put("pendingRestaurants", pendingRestaurants);
        stats.put("approvedRestaurants", approvedRestaurants);
        stats.put("rejectedRestaurants", rejectedRestaurants);

        return stats;
    }

    // =========================
    // IMAGE SAVE HELPER
    // =========================

    // Saves uploaded image to local uploads folder
    private String saveImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return null;
        }

        try {
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
            File dir = new File(uploadDir);

            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalFilename = image.getOriginalFilename();
            String extension = "";

            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFileName = UUID.randomUUID() + extension;
            File destination = new File(dir, newFileName);
            image.transferTo(destination);

            return "/uploads/" + newFileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to save image");
        }
    }
}