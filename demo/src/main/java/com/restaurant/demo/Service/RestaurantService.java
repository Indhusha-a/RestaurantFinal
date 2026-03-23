package com.restaurant.demo.Service;

import com.restaurant.demo.Entity.*;
import com.restaurant.demo.Repository.*;
import com.restaurant.demo.enums.BudgetRange;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final RatingRepository ratingRepository;
    private final VisitsRepository visitsRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final TagService tagService;
    private final SpecialityService specialityService;

    // ==================== BASIC CRUD ====================

    public Restaurant registerRestaurant(Restaurant restaurant) {

        return restaurantRepository.save(restaurant);
    }

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
    }

    public List<Map<String, Object>> getTopRestaurantsOfTheWeek() {
        return restaurantRepository.findTop10ByIsApprovedTrueAndIsActiveTrueOrderByPointsDescIdAsc()
                .stream()
                .map(this::buildRestaurantCardWithPoints)
                .collect(Collectors.toList());
    }

    // ==================== INDIVIDUAL MODE FILTERING ====================

    // Filters approved restaurants by craving, budget and vibe tags
    // Fallback: removes tags if no results, then tries similar cuisines
    public List<Map<String, Object>> filterRestaurants(String craving, String budgetStr, List<Long> tagIds) {

        // Step 1: Map budget string from frontend to BudgetRange enum
        BudgetRange budgetRange = mapBudgetString(budgetStr);

        // Step 2: Start with craving-based filter
        List<Restaurant> candidates;
        if (craving != null && !craving.trim().isEmpty()) {
            if (budgetRange != null) {
                candidates = restaurantRepository.findBySpecialityNameAndBudget(craving, budgetRange);
            } else {
                candidates = restaurantRepository.findBySpecialityName(craving);
            }
        } else if (budgetRange != null) {
            candidates = restaurantRepository.findByIsApprovedTrueAndIsActiveTrueAndBudgetRange(budgetRange);
        } else {
            candidates = restaurantRepository.findByIsApprovedTrueAndIsActiveTrue();
        }

        // Step 3: Filter by vibe tags if provided
        if (tagIds != null && !tagIds.isEmpty()) {
            List<Restaurant> tagFiltered = filterByTags(candidates, tagIds);

            // Step 4: If no results with tags, remove tags and retry
            if (tagFiltered.isEmpty()) {
                // Fallback — keep craving + budget results without tag filter
            } else {
                candidates = tagFiltered;
            }
        }

        // Step 5: If still no results, try similar cuisines
        if (candidates.isEmpty() && craving != null && !craving.trim().isEmpty()) {
            List<String> similarCuisines = getSimilarCuisines(craving);
            for (String similar : similarCuisines) {
                candidates = restaurantRepository.findBySpecialityName(similar);
                if (!candidates.isEmpty())
                    break;
            }
        }

        // Step 6: Build response cards with average rating
        return candidates.stream()
                .map(this::buildRestaurantCard)
                .collect(Collectors.toList());
    }

    // Filters candidates to those that match at least one selected vibe tag
    private List<Restaurant> filterByTags(List<Restaurant> candidates, List<Long> tagIds) {
        return candidates.stream()
                .filter(r -> r.getTags() != null && r.getTags().stream()
                        .anyMatch(tag -> tagIds.contains(tag.getId())))
                .collect(Collectors.toList());
    }

    // Maps craving to related cuisines for fallback search
    private List<String> getSimilarCuisines(String craving) {
        Map<String, List<String>> cuisineMap = new HashMap<>();
        cuisineMap.put("pizza", Arrays.asList("pasta", "italian"));
        cuisineMap.put("pasta", Arrays.asList("pizza", "italian"));
        cuisineMap.put("burger", Arrays.asList("sandwich", "grill"));
        cuisineMap.put("kottu", Arrays.asList("fried rice", "string hoppers"));
        cuisineMap.put("fried rice", Arrays.asList("kottu", "nasi goreng"));
        cuisineMap.put("sushi", Arrays.asList("japanese", "ramen"));
        cuisineMap.put("ramen", Arrays.asList("japanese", "sushi"));
        cuisineMap.put("biryani", Arrays.asList("rice", "indian"));
        cuisineMap.put("chinese", Arrays.asList("noodles", "fried rice"));
        cuisineMap.put("noodles", Arrays.asList("chinese", "ramen"));

        return cuisineMap.getOrDefault(craving.toLowerCase(), Collections.emptyList());
    }

    // Builds a restaurant response card with all details and average rating
    private Map<String, Object> buildRestaurantCard(Restaurant r) {
        Map<String, Object> card = new LinkedHashMap<>();
        card.put("restaurantId", r.getId());
        card.put("name", r.getName());
        card.put("description", r.getDescription());
        card.put("phone", r.getPhone());
        card.put("address", r.getAddress());
        card.put("locationLink", r.getLocationLink());
        card.put("budgetRange", mapBudgetToString(r.getBudgetRange()));
        card.put("image1Path", r.getImage1Path());
        card.put("image2Path", r.getImage2Path());

        // Compute average rating from all ratings for this restaurant
        List<Rating> ratings = ratingRepository.findByRestaurantId(r.getId());
        if (!ratings.isEmpty()) {
            double avg = ratings.stream().mapToInt(Rating::getRatingValue).average().orElse(0);
            card.put("averageRating", Math.round(avg * 10.0) / 10.0);
            card.put("totalRatings", ratings.size());
        } else {
            card.put("averageRating", "New");
            card.put("totalRatings", 0);
        }

        // Include tag and speciality names for display
        card.put("tags", r.getTags() != null
                ? r.getTags().stream().map(Tag::getTagName).collect(Collectors.toList())
                : Collections.emptyList());
        card.put("specialties", r.getSpecialities() != null
                ? r.getSpecialities().stream().map(Speciality::getName).collect(Collectors.toList())
                : Collections.emptyList());

        return card;
    }

    private Map<String, Object> buildRestaurantCardWithPoints(Restaurant restaurant) {
        Map<String, Object> card = buildRestaurantCard(restaurant);
        card.put("points", restaurant.getPoints() != null ? restaurant.getPoints() : 0);
        return card;
    }

    // ==================== RESTAURANT SELECTION + NOTIFICATION ====================

    // Records a visit and notifies the restaurant about user arrival
    public Map<String, Object> selectRestaurant(Long userId, Long restaurantId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        // Create visit record for individual mode
        Visits visit = Visits.builder()
                .user(user)
                .restaurant(restaurant)
                .mode("INDIVIDUAL")
                .build();
        visitsRepository.save(visit);

        // Send notification to restaurant about user arrival
        Notification notification = Notification.builder()
                .userId(restaurantId)
                .message(user.getFirstName() + " " + user.getLastName()
                        + " (@" + user.getUsername() + ") is visiting your restaurant!")
                .type("RESTAURANT_ARRIVAL")
                .build();
        notificationRepository.save(notification);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Restaurant selected! A notification has been sent.");
        response.put("visitId", visit.getId());
        response.put("restaurantName", restaurant.getName());
        response.put("phone", restaurant.getPhone());
        response.put("locationLink", restaurant.getLocationLink());
        return response;
    }

    // ==================== POST-VISIT RATING ====================

    // Saves user rating after visiting (used by collaborative filtering)
    public Map<String, String> rateVisit(Long userId, Long restaurantId, Integer ratingValue) {
        if (ratingValue < 1 || ratingValue > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        // Save/update in ratings table (for collaborative filtering - Member 2)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Rating rating = ratingRepository
                .findByUserUserIdAndRestaurantId(userId, restaurantId)
                .orElse(new Rating());
        rating.setUser(user);
        rating.setRestaurant(restaurant);
        rating.setRatingValue(ratingValue);
        ratingRepository.save(rating);

        // Also update the visit record with the rating given
        List<Visits> visits = visitsRepository.findByUserUserIdAndMode(userId, "INDIVIDUAL");
        visits.stream()
                .filter(v -> v.getRestaurant().getId().equals(restaurantId) && v.getRatingGiven() == null)
                .findFirst()
                .ifPresent(v -> {
                    v.setRatingGiven(ratingValue);
                    visitsRepository.save(v);
                });

        Map<String, String> response = new HashMap<>();
        response.put("message", "Rating submitted successfully");
        return response;
    }

    // ==================== BUDGET MAPPING HELPERS ====================

    // Maps frontend budget string ("0-1000") to BudgetRange enum
    private BudgetRange mapBudgetString(String budget) {
        if (budget == null || budget.isEmpty())
            return null;
        switch (budget) {
            case "0-1000":
                return BudgetRange.ZERO_TO_1000;
            case "1000-2000":
                return BudgetRange.ONE_TO_2000;
            case "2000-5000":
                return BudgetRange.TWO_TO_5000;
            case "5000+":
                return BudgetRange.FIVE_THOUSAND_PLUS;
            default:
                return null;
        }
    }

    // Maps BudgetRange enum back to frontend-readable string
    private String mapBudgetToString(BudgetRange range) {
        if (range == null)
            return "";
        switch (range) {
            case ZERO_TO_1000:
                return "0-1000";
            case ONE_TO_2000:
                return "1000-2000";
            case TWO_TO_5000:
                return "2000-5000";
            case FIVE_THOUSAND_PLUS:
                return "5000+";
            default:
                return "";
        }
    }
}
