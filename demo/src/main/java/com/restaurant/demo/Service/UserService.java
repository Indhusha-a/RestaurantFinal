package com.restaurant.demo.Service;

import com.restaurant.demo.Entity.User;
import com.restaurant.demo.Entity.Visits;
import com.restaurant.demo.Entity.Notification;
import com.restaurant.demo.enums.Role;
import com.restaurant.demo.Repository.UserRepository;
import com.restaurant.demo.Repository.VisitsRepository;
import com.restaurant.demo.Repository.NotificationRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final VisitsRepository visitsRepository;
    private final NotificationRepository notificationRepository;

    // ==================== ADMIN SEEDING ====================

    @PostConstruct
    public void seedAdmin() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .firstName("System")
                    .lastName("Admin")
                    .username("admin")
                    .email("admin@iamhungry.com")
                    .password("Admin@123")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
        }
    }

    // ==================== AUTH ====================

    public Map<String, Object> register(Map<String, String> data) {
        String username = data.get("username");
        String email = data.get("email");
        String password = data.get("password");
        String firstName = data.get("firstName");
        String lastName = data.get("lastName");
        String phoneNumber = data.get("phoneNumber");
        String gender = data.get("gender");
        String avatarIcon = data.getOrDefault("avatarIcon", "neutral");

        // Validate required fields
        if (username == null || email == null || password == null || firstName == null || lastName == null) {
            throw new RuntimeException("All required fields must be provided");
        }

        // Validate username uniqueness
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already taken");
        }

        // Validate email uniqueness
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        // Validate email contains @
        if (!email.contains("@")) {
            throw new RuntimeException("Email must contain @ symbol");
        }

        // Validate phone number is exactly 10 digits
        if (phoneNumber != null && !phoneNumber.matches("\\d{10}")) {
            throw new RuntimeException("Phone number must be exactly 10 digits");
        }

        // Validate password has capital letter and special character
        if (!password.matches(".*[A-Z].*")) {
            throw new RuntimeException("Password must contain at least one capital letter");
        }
        if (!password.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            throw new RuntimeException("Password must contain at least one special character");
        }

        // Build and save user (password stored as plain text per requirement)
        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .username(username)
                .email(email)
                .password(password)
                .phoneNumber(phoneNumber)
                .gender(gender)
                .avatarIcon(avatarIcon)
                .build();

        User saved = userRepository.save(user);

        // Generate simple token (base64 of userId for uni project)
        String token = Base64.getEncoder().encodeToString(("user:" + saved.getUserId()).getBytes());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", token);
        response.put("userId", saved.getUserId());
        response.put("username", saved.getUsername());
        response.put("email", saved.getEmail());
        response.put("firstName", saved.getFirstName());
        response.put("lastName", saved.getLastName());
        response.put("avatarIcon", saved.getAvatarIcon());
        response.put("role", saved.getRole().name());
        response.put("message", "Registration successful");
        return response;
    }

    public Map<String, Object> login(String usernameOrEmail, String password) {
        // Find user by username or email
        Optional<User> optionalUser = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);

        if (optionalUser.isEmpty()) {
            throw new RuntimeException("No account found with that username or email");
        }

        User user = optionalUser.get();

        // Check if user is active
        if (!user.getIsActive()) {
            throw new RuntimeException("Account is deactivated. Contact admin.");
        }

        // Compare plain text password (no hashing per requirement)
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password. Please try again.");
        }

        // Generate token
        String token = Base64.getEncoder().encodeToString(("user:" + user.getUserId()).getBytes());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", token);
        response.put("userId", user.getUserId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("avatarIcon", user.getAvatarIcon());
        response.put("role", user.getRole().name());
        response.put("message", "Login successful");
        return response;
    }

    public Map<String, Boolean> checkUsername(String username) {
        boolean exists = userRepository.existsByUsername(username);
        Map<String, Boolean> result = new HashMap<>();
        result.put("available", !exists);
        return result;
    }

    public Map<String, Boolean> checkEmail(String email) {
        boolean exists = userRepository.existsByEmail(email);
        Map<String, Boolean> result = new HashMap<>();
        result.put("available", !exists);
        return result;
    }

    // ==================== PROFILE ====================

    public Map<String, Object> getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long totalVisits = visitsRepository.findByUserUserIdOrderByVisitDateDesc(userId).size();

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("userId", user.getUserId());
        profile.put("firstName", user.getFirstName());
        profile.put("lastName", user.getLastName());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("phoneNumber", user.getPhoneNumber());
        profile.put("gender", user.getGender());
        profile.put("avatarIcon", user.getAvatarIcon());
        profile.put("role", user.getRole().name());
        profile.put("isActive", user.getIsActive());
        profile.put("createdAt", user.getCreatedAt());
        profile.put("totalVisits", totalVisits);
        profile.put("points", 0);
        profile.put("groups", 0);
        return profile;
    }

    public Map<String, Object> updateProfile(Long userId, Map<String, Object> data) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only update editable fields (username and email are NOT editable)
        if (data.containsKey("firstName")) {
            String firstName = (String) data.get("firstName");
            if (firstName == null || firstName.trim().isEmpty()) {
                throw new RuntimeException("First name cannot be empty");
            }
            user.setFirstName(firstName.trim());
        }
        if (data.containsKey("lastName")) {
            String lastName = (String) data.get("lastName");
            if (lastName == null || lastName.trim().isEmpty()) {
                throw new RuntimeException("Last name cannot be empty");
            }
            user.setLastName(lastName.trim());
        }
        if (data.containsKey("phoneNumber")) {
            String phone = (String) data.get("phoneNumber");
            if (phone != null && !phone.matches("\\d{10}")) {
                throw new RuntimeException("Phone number must be exactly 10 digits");
            }
            user.setPhoneNumber(phone);
        }
        if (data.containsKey("gender")) {
            user.setGender((String) data.get("gender"));
        }
        if (data.containsKey("avatarIcon")) {
            user.setAvatarIcon((String) data.get("avatarIcon"));
        }

        User updated = userRepository.save(user);

        // Return updated user data
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("userId", updated.getUserId());
        response.put("firstName", updated.getFirstName());
        response.put("lastName", updated.getLastName());
        response.put("username", updated.getUsername());
        response.put("email", updated.getEmail());
        response.put("phoneNumber", updated.getPhoneNumber());
        response.put("gender", updated.getGender());
        response.put("avatarIcon", updated.getAvatarIcon());
        response.put("message", "Profile updated successfully");
        return response;
    }

    public Map<String, String> requestDeletion(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setDeletionRequested(true);
        userRepository.save(user);

        Map<String, String> result = new HashMap<>();
        result.put("message", "Deletion request submitted. Admin will review your request.");
        return result;
    }

    // ==================== VISITS ====================

    public List<Map<String, Object>> getVisitHistory(Long userId) {
        List<Visits> visits = visitsRepository.findByUserUserIdOrderByVisitDateDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Visits visit : visits) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("visitId", visit.getId());
            item.put("restaurantId", visit.getRestaurant().getId());
            item.put("restaurantName", visit.getRestaurant().getName());
            item.put("restaurantDescription", visit.getRestaurant().getDescription());
            item.put("visitDate", visit.getVisitDate());
            item.put("mode", visit.getMode());
            item.put("ratingGiven", visit.getRatingGiven());
            result.add(item);
        }
        return result;
    }

    // ==================== NOTIFICATIONS ====================

    public List<Notification> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    // ==================== SEARCH ====================

    public List<Map<String, Object>> searchUsers(String query) {
        List<User> users = userRepository.findByUsernameContainingIgnoreCase(query);
        List<Map<String, Object>> result = new ArrayList<>();

        for (User u : users) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("userId", u.getUserId());
            item.put("username", u.getUsername());
            item.put("firstName", u.getFirstName());
            item.put("lastName", u.getLastName());
            item.put("avatarIcon", u.getAvatarIcon());
            result.add(item);
        }
        return result;
    }

    // ==================== TOKEN HELPER ====================

    public Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid authorization token");
        }
        try {
            String token = authHeader.substring(7);
            String decoded = new String(Base64.getDecoder().decode(token));
            // Token format is "user:123"
            return Long.parseLong(decoded.split(":")[1]);
        } catch (Exception e) {
            throw new RuntimeException("Invalid token");
        }
    }
}
