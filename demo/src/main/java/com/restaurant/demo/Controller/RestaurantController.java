package com.restaurant.demo.Controller;

import com.restaurant.demo.Entity.Restaurant;
import com.restaurant.demo.Service.RestaurantService;
import com.restaurant.demo.Service.SpecialityService;
import com.restaurant.demo.Service.TagService;
import com.restaurant.demo.Service.UserService;
import com.restaurant.demo.enums.BudgetRange;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RestaurantController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private final RestaurantService restaurantService;
    private final SpecialityService specialityService;
    private final TagService tagService;
    private final UserService userService;

    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerRestaurant(@RequestBody Map<String, Object> data) {
        try {
            Restaurant restaurant = new Restaurant();
            restaurant.setName((String) data.get("name"));
            restaurant.setDescription((String) data.get("description"));
            restaurant.setEmail((String) data.get("email"));
            restaurant.setPassword((String) data.get("password"));
            restaurant.setPhone((String) data.get("phone"));
            restaurant.setAddress((String) data.get("address"));
            restaurant.setLocationLink((String) data.get("locationLink"));
            restaurant.setBudgetRange(parseBudgetRange((String) data.get("budgetRange")));
            restaurant.setMenuPdfPath(resolveStoredFile(
                    (String) data.get("menuPdfPath"),
                    (String) data.get("menuBase64"),
                    (String) data.get("menuFileName"),
                    "menu"
            ));
            restaurant.setImage1Path(resolveStoredFile(
                    (String) data.get("image1Path"),
                    (String) data.get("image1Base64"),
                    (String) data.get("image1FileName"),
                    "image1"
            ));
            restaurant.setImage2Path(resolveStoredFile(
                    (String) data.get("image2Path"),
                    (String) data.get("image2Base64"),
                    (String) data.get("image2FileName"),
                    "image2"
            ));

            List<String> specialties = data.get("specialties") == null ? List.of() : (List<String>) data.get("specialties");
            List<String> desserts = data.get("desserts") == null ? List.of() : (List<String>) data.get("desserts");
            List<String> tags = data.get("tags") == null ? List.of() : (List<String>) data.get("tags");

            Restaurant saved = restaurantService.createRestaurantApplication(restaurant, specialties, desserts, tags);
            return ResponseEntity.ok(Map.of(
                    "restaurantId", saved.getId(),
                    "approvalStatus", saved.getApprovalStatus(),
                    "message", "Restaurant registration submitted for admin approval."
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Restaurant registration failed"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginRestaurant(@RequestBody Map<String, String> data) {
        try {
            return ResponseEntity.ok(restaurantService.restaurantLogin(data.get("email"), data.get("password")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getRestaurantProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            Long restaurantId = restaurantService.extractRestaurantId(authHeader);
            return ResponseEntity.ok(restaurantService.getRestaurantProfile(restaurantId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateRestaurantProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> data
    ) {
        try {
            Long restaurantId = restaurantService.extractRestaurantId(authHeader);
            return ResponseEntity.ok(restaurantService.updateRestaurantProfile(restaurantId, data));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getRestaurantNotifications(@RequestHeader("Authorization") String authHeader) {
        try {
            Long restaurantId = restaurantService.extractRestaurantId(authHeader);
            return ResponseEntity.ok(restaurantService.getRestaurantNotifications(restaurantId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/activities")
    public ResponseEntity<?> getRestaurantActivities(@RequestHeader("Authorization") String authHeader) {
        try {
            Long restaurantId = restaurantService.extractRestaurantId(authHeader);
            return ResponseEntity.ok(restaurantService.getRestaurantActivities(restaurantId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/activities/{visitId}/confirm")
    public ResponseEntity<?> confirmVisit(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long visitId
    ) {
        try {
            Long restaurantId = restaurantService.extractRestaurantId(authHeader);
            return ResponseEntity.ok(restaurantService.confirmVisit(restaurantId, visitId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/boost/request")
    public ResponseEntity<?> requestBoost(@RequestHeader("Authorization") String authHeader) {
        try {
            Long restaurantId = restaurantService.extractRestaurantId(authHeader);
            return ResponseEntity.ok(restaurantService.requestBoost(restaurantId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/performance")
    public ResponseEntity<?> getPerformance(@RequestHeader("Authorization") String authHeader) {
        try {
            Long restaurantId = restaurantService.extractRestaurantId(authHeader);
            return ResponseEntity.ok(restaurantService.getPerformance(restaurantId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/specialties")
    public ResponseEntity<?> getMainSpecialties() {
        return ResponseEntity.ok(specialityService.getMainSpecialities());
    }

    @GetMapping("/desserts")
    public ResponseEntity<?> getDesserts() {
        return ResponseEntity.ok(specialityService.getDessertSpecialities());
    }

    @GetMapping("/tags")
    public ResponseEntity<?> getTags() {
        return ResponseEntity.ok(tagService.getAllTags());
    }

    @GetMapping("/")
    public ResponseEntity<?> getAllRestaurants() {
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }

    @PostMapping("/filter")
    public ResponseEntity<?> filterRestaurants(@RequestBody Map<String, Object> data) {
        String craving = (String) data.get("craving");
        String budgetRange = (String) data.get("budgetRange");
        List<Long> tagIds = data.get("tagIds") == null ? null : ((List<?>) data.get("tagIds")).stream()
                .map(value -> Long.parseLong(String.valueOf(value)))
                .toList();
        return ResponseEntity.ok(restaurantService.filterRestaurants(craving, budgetRange, tagIds));
    }

    @PostMapping("/{restaurantId}/select")
    public ResponseEntity<?> selectRestaurant(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long restaurantId
    ) {
        try {
            Long userId = userService.extractUserId(authHeader);
            return ResponseEntity.ok(restaurantService.selectRestaurant(userId, restaurantId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{restaurantId}/rate")
    public ResponseEntity<?> rateRestaurant(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long restaurantId,
            @RequestBody Map<String, Integer> data
    ) {
        try {
            Long userId = userService.extractUserId(authHeader);
            return ResponseEntity.ok(restaurantService.rateVisit(userId, restaurantId, data.get("ratingValue")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private BudgetRange parseBudgetRange(String budgetRange) {
        if (budgetRange == null || budgetRange.isBlank()) {
            return BudgetRange.ZERO_TO_1000;
        }
        switch (budgetRange) {
            case "0-1000":
                return BudgetRange.ZERO_TO_1000;
            case "1000-2000":
                return BudgetRange.ONE_TO_2000;
            case "2000-5000":
                return BudgetRange.TWO_TO_5000;
            case "5000+":
                return BudgetRange.FIVE_THOUSAND_PLUS;
            default:
                return BudgetRange.ZERO_TO_1000;
        }
    }

    private String storeBase64File(String base64Data, String originalName, String prefix) throws IOException {
        if (base64Data == null || base64Data.isBlank()) {
            return null;
        }

        String[] parts = base64Data.split(",", 2);
        String metadata = parts[0];
        String encoded = parts.length > 1 ? parts[1] : parts[0];
        String extension = resolveExtension(metadata, originalName, prefix);
        String fileName = System.currentTimeMillis() + "_" + prefix + extension;

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);
        Files.write(filePath, Base64.getDecoder().decode(encoded));
        return "/uploads/" + fileName;
    }

    private String resolveStoredFile(String existingUrl, String base64Data, String originalName, String prefix) throws IOException {
        if (existingUrl != null && !existingUrl.isBlank()) {
            return existingUrl;
        }
        return storeBase64File(base64Data, originalName, prefix);
    }

    private String resolveExtension(String metadata, String originalName, String prefix) {
        if (originalName != null && originalName.contains(".")) {
            return originalName.substring(originalName.lastIndexOf('.'));
        }
        if (metadata.contains("application/pdf")) {
            return ".pdf";
        }
        if (metadata.contains("image/png")) {
            return ".png";
        }
        if (metadata.contains("image/webp")) {
            return ".webp";
        }
        if (metadata.contains("image/gif")) {
            return ".gif";
        }
        if (metadata.contains("image/jpeg") || metadata.contains("image/jpg")) {
            return ".jpg";
        }
        return ".bin";
    }
}
