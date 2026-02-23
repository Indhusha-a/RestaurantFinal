package com.restaurant.demo.Controller;

import com.restaurant.demo.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    // ==================== AUTH ENDPOINTS ====================

    @PostMapping("/api/auth/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> data) {
        try {
            Map<String, Object> result = userService.register(data);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/api/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data) {
        try {
            String usernameOrEmail = data.get("usernameOrEmail");
            String password = data.get("password");

            if (usernameOrEmail == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username/email and password are required"));
            }

            Map<String, Object> result = userService.login(usernameOrEmail, password);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/api/auth/check-username/{username}")
    public ResponseEntity<?> checkUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.checkUsername(username));
    }

    @GetMapping("/api/auth/check-email/{email}")
    public ResponseEntity<?> checkEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.checkEmail(email));
    }

    // ==================== USER PROFILE ENDPOINTS ====================

    @GetMapping("/api/users/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = userService.extractUserId(authHeader);
            return ResponseEntity.ok(userService.getProfile(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/api/users/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> data) {
        try {
            Long userId = userService.extractUserId(authHeader);
            return ResponseEntity.ok(userService.updateProfile(userId, data));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/api/users/deletion-request")
    public ResponseEntity<?> requestDeletion(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = userService.extractUserId(authHeader);
            return ResponseEntity.ok(userService.requestDeletion(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ==================== VISIT HISTORY ====================

    @GetMapping("/api/users/visits")
    public ResponseEntity<?> getVisitHistory(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = userService.extractUserId(authHeader);
            return ResponseEntity.ok(userService.getVisitHistory(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    // ==================== USER SEARCH (for group mode) ====================

    @GetMapping("/api/users/search")
    public ResponseEntity<?> searchUsers(@RequestParam String q) {
        return ResponseEntity.ok(userService.searchUsers(q));
    }

    // ==================== NOTIFICATIONS ====================

    @GetMapping("/api/users/notifications")
    public ResponseEntity<?> getNotifications(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = userService.extractUserId(authHeader);
            return ResponseEntity.ok(userService.getNotifications(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/api/users/notifications/unread-count")
    public ResponseEntity<?> getUnreadCount(@RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = userService.extractUserId(authHeader);
            return ResponseEntity.ok(Map.of("count", userService.getUnreadCount(userId)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }
}