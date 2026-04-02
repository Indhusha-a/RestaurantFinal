package com.restaurant.demo.Service;

import com.restaurant.demo.Entity.Notification;
import com.restaurant.demo.Entity.Rating;
import com.restaurant.demo.Entity.Restaurant;
import com.restaurant.demo.Entity.Speciality;
import com.restaurant.demo.Entity.Tag;
import com.restaurant.demo.Entity.User;
import com.restaurant.demo.Entity.Visits;
import com.restaurant.demo.Repository.NotificationRepository;
import com.restaurant.demo.Repository.RatingRepository;
import com.restaurant.demo.Repository.RestaurantRepository;
import com.restaurant.demo.Repository.UserRepository;
import com.restaurant.demo.Repository.VisitsRepository;
import com.restaurant.demo.enums.BudgetRange;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
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

    public Restaurant registerRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    @PostConstruct
    public void seedApprovedDemoRestaurant() {
        if (restaurantRepository.existsByEmail("demo.restaurant@iamhungry.com")) {
            return;
        }

        Restaurant restaurant = Restaurant.builder()
                .name("Demo Bistro")
                .description("Approved demo restaurant account for university demonstration.")
                .email("demo.restaurant@iamhungry.com")
                .password("Demo@123")
                .phone("0771234567")
                .address("45 Demo Street, Colombo")
                .locationLink("https://maps.google.com")
                .budgetRange(BudgetRange.ONE_TO_2000)
                .menuPdfPath(null)
                .image1Path(null)
                .image2Path(null)
                .isApproved(true)
                .isRejected(false)
                .approvalStatus("APPROVED")
                .isActive(true)
                .points(120)
                .boostRequested(false)
                .approvedAt(LocalDateTime.now())
                .build();

        restaurant.setSpecialities(new LinkedHashSet<>(List.of(
                specialityService.getOrCreate("Pizza", "MAIN"),
                specialityService.getOrCreate("Pasta", "MAIN"),
                specialityService.getOrCreate("Brownies", "DESSERT")
        )));
        restaurant.setTags(new LinkedHashSet<>(List.of(
                tagService.getOrCreate("Cozy Cafe"),
                tagService.getOrCreate("Family Friendly"),
                tagService.getOrCreate("Romantic")
        )));

        restaurantRepository.save(restaurant);
    }

    public Restaurant createRestaurantApplication(
            Restaurant restaurant,
            List<String> mainSpecialities,
            List<String> dessertSpecialities,
            List<String> tags
    ) {
        if (restaurant.getEmail() == null || !restaurant.getEmail().contains("@")) {
            throw new RuntimeException("Email must contain @ symbol");
        }
        if (restaurantRepository.existsByEmail(restaurant.getEmail())) {
            throw new RuntimeException("A restaurant with this email already exists");
        }
        if (restaurant.getPassword() == null || !restaurant.getPassword().matches(".*[A-Z].*")) {
            throw new RuntimeException("Password must contain at least one capital letter");
        }
        if (restaurant.getPassword() == null || !restaurant.getPassword().matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*")) {
            throw new RuntimeException("Password must contain at least one special character");
        }
        if (restaurant.getPhone() == null || !restaurant.getPhone().matches("\\d{10}")) {
            throw new RuntimeException("Phone number must be exactly 10 digits");
        }
        if (mainSpecialities == null || mainSpecialities.isEmpty() || mainSpecialities.size() > 10) {
            throw new RuntimeException("Select between 1 and 10 main specialties");
        }
        if (dessertSpecialities != null && dessertSpecialities.size() > 5) {
            throw new RuntimeException("Select up to 5 dessert specialties");
        }
        if (tags == null || tags.size() != 3) {
            throw new RuntimeException("Exactly 3 vibe tags must be selected");
        }

        Set<Speciality> specialities = new LinkedHashSet<>();
        mainSpecialities.forEach(name -> specialities.add(specialityService.getOrCreate(name, "MAIN")));
        if (dessertSpecialities != null) {
            dessertSpecialities.forEach(name -> specialities.add(specialityService.getOrCreate(name, "DESSERT")));
        }

        Set<Tag> restaurantTags = tags.stream()
                .map(tagService::getOrCreate)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        restaurant.setSpecialities(specialities);
        restaurant.setTags(restaurantTags);
        restaurant.setIsApproved(false);
        restaurant.setIsRejected(false);
        restaurant.setIsActive(true);
        restaurant.setApprovalStatus("PENDING");
        restaurant.setApprovedAt(null);
        restaurant.setRejectionReason(null);
        restaurant.setPoints(0);
        restaurant.setBoostRequested(false);

        return restaurantRepository.save(restaurant);
    }

    public Map<String, Object> restaurantLogin(String email, String password) {
        Restaurant restaurant = restaurantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Wrong restaurant credentials"));

        if (!Objects.equals(restaurant.getPassword(), password)) {
            throw new RuntimeException("Wrong restaurant credentials");
        }

        if (Boolean.TRUE.equals(restaurant.getIsRejected()) || "REJECTED".equalsIgnoreCase(restaurant.getApprovalStatus())) {
            restaurantRepository.delete(restaurant);
            throw new RuntimeException("Application rejected. Please register again.");
        }

        String token = Base64.getEncoder().encodeToString(("restaurant:" + restaurant.getId()).getBytes());
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", token);
        response.put("restaurantId", restaurant.getId());
        response.put("email", restaurant.getEmail());
        response.put("name", restaurant.getName());
        response.put("role", "RESTAURANT");
        response.put("approvalStatus", restaurant.getApprovalStatus());
        response.put("isApproved", restaurant.getIsApproved());
        response.put(
                "message",
                "APPROVED".equalsIgnoreCase(restaurant.getApprovalStatus())
                        ? "Restaurant login successful"
                        : "Login successful. Your restaurant is still pending admin approval."
        );
        return response;
    }

    public Long extractRestaurantId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid authorization token");
        }
        try {
            String token = authHeader.substring(7);
            String decoded = new String(Base64.getDecoder().decode(token));
            return Long.parseLong(decoded.split(":")[1]);
        } catch (Exception e) {
            throw new RuntimeException("Invalid restaurant token");
        }
    }

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findByIsApprovedTrueAndIsActiveTrue();
    }

    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
    }

    public Map<String, Object> getRestaurantProfile(Long restaurantId) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("restaurantId", restaurant.getId());
        profile.put("name", restaurant.getName());
        profile.put("description", restaurant.getDescription());
        profile.put("email", restaurant.getEmail());
        profile.put("phone", restaurant.getPhone());
        profile.put("address", restaurant.getAddress());
        profile.put("locationLink", restaurant.getLocationLink());
        profile.put("budgetRange", mapBudgetToString(restaurant.getBudgetRange()));
        profile.put("menuPdfPath", restaurant.getMenuPdfPath());
        profile.put("image1Path", restaurant.getImage1Path());
        profile.put("image2Path", restaurant.getImage2Path());
        profile.put("points", restaurant.getPoints());
        profile.put("boostRequested", restaurant.getBoostRequested());
        profile.put("approvalStatus", restaurant.getApprovalStatus());
        profile.put("tags", restaurant.getTags() == null ? Collections.emptyList() :
                restaurant.getTags().stream().map(Tag::getTagName).collect(Collectors.toList()));
        profile.put("specialties", restaurant.getSpecialities() == null ? Collections.emptyList() :
                restaurant.getSpecialities().stream().map(Speciality::getName).collect(Collectors.toList()));
        return profile;
    }

    public Map<String, Object> updateRestaurantProfile(Long restaurantId, Map<String, Object> data) {
        Restaurant restaurant = getRestaurantById(restaurantId);

        if (data.containsKey("name")) {
            restaurant.setName(Objects.toString(data.get("name"), "").trim());
        }
        if (data.containsKey("description")) {
            restaurant.setDescription(Objects.toString(data.get("description"), "").trim());
        }
        if (data.containsKey("phone")) {
            String phone = Objects.toString(data.get("phone"), "");
            if (!phone.matches("\\d{10}")) {
                throw new RuntimeException("Phone number must be exactly 10 digits");
            }
            restaurant.setPhone(phone);
        }
        if (data.containsKey("locationLink")) {
            restaurant.setLocationLink(Objects.toString(data.get("locationLink"), "").trim());
        }
        if (data.containsKey("menuPdfPath")) {
            restaurant.setMenuPdfPath((String) data.get("menuPdfPath"));
        }

        Restaurant saved = restaurantRepository.save(restaurant);
        return getRestaurantProfile(saved.getId());
    }

    public List<Notification> getRestaurantNotifications(Long restaurantId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(restaurantId);
    }

    public Map<String, Object> getRestaurantActivities(Long restaurantId) {
        List<Visits> individual = visitsRepository.findByRestaurantIdAndModeOrderByVisitDateDesc(restaurantId, "INDIVIDUAL");
        List<Visits> group = visitsRepository.findByRestaurantIdAndModeOrderByVisitDateDesc(restaurantId, "GROUP");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("individualRequests", individual.stream().map(this::mapVisit).collect(Collectors.toList()));
        result.put("groupRequests", group.stream().map(this::mapVisit).collect(Collectors.toList()));
        return result;
    }

    public Map<String, Object> confirmVisit(Long restaurantId, Long visitId) {
        Visits visit = visitsRepository.findById(visitId)
                .orElseThrow(() -> new RuntimeException("Visit not found"));

        if (!visit.getRestaurant().getId().equals(restaurantId)) {
            throw new RuntimeException("This visit does not belong to your restaurant");
        }

        visit.setConfirmedByRestaurant(true);
        visitsRepository.save(visit);

        notificationRepository.save(Notification.builder()
                .userId(visit.getUser().getUserId())
                .message("Your visit to " + visit.getRestaurant().getName() + " was confirmed by the restaurant.")
                .type("VISIT_CONFIRMED")
                .build());

        return Map.of("message", "Visit confirmed successfully");
    }

    public Map<String, Object> requestBoost(Long restaurantId) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        if (restaurant.getPoints() < 50) {
            throw new RuntimeException("You need at least 50 points to request a boost");
        }
        restaurant.setPoints(restaurant.getPoints() - 50);
        restaurant.setBoostRequested(true);
        restaurantRepository.save(restaurant);
        return Map.of(
                "message", "Boost requested successfully",
                "points", restaurant.getPoints(),
                "boostRequested", true
        );
    }

    public Map<String, Object> getPerformance(Long restaurantId) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        List<Visits> visits = visitsRepository.findByRestaurantIdOrderByVisitDateDesc(restaurantId);
        List<Rating> ratings = ratingRepository.findByRestaurantId(restaurantId);
        List<Restaurant> rankedRestaurants = restaurantRepository.findByIsApprovedTrueAndIsActiveTrue().stream()
                .sorted(Comparator.comparing(Restaurant::getPoints, Comparator.nullsFirst(Integer::compareTo)).reversed())
                .collect(Collectors.toList());

        Map<String, Long> monthlyVisits = visits.stream().collect(Collectors.groupingBy(
                visit -> visit.getVisitDate().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                LinkedHashMap::new,
                Collectors.counting()
        ));

        double averageRating = ratings.stream().mapToInt(Rating::getRatingValue).average().orElse(0.0);
        Integer currentPosition = null;
        boolean featuredInTopTen = false;

        if (Boolean.TRUE.equals(restaurant.getIsApproved())) {
            for (int index = 0; index < rankedRestaurants.size(); index++) {
                if (Objects.equals(rankedRestaurants.get(index).getId(), restaurantId)) {
                    currentPosition = index + 1;
                    featuredInTopTen = currentPosition <= 10;
                    break;
                }
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("points", restaurant.getPoints());
        result.put("totalVisits", visits.size());
        result.put("individualVisits", visits.stream().filter(v -> "INDIVIDUAL".equalsIgnoreCase(v.getMode())).count());
        result.put("groupVisits", visits.stream().filter(v -> "GROUP".equalsIgnoreCase(v.getMode())).count());
        result.put("averageRating", Math.round(averageRating * 10.0) / 10.0);
        result.put("totalRatings", ratings.size());
        result.put("monthlyVisits", monthlyVisits);
        result.put("currentPosition", currentPosition);
        result.put("featuredInTopTen", featuredInTopTen);
        result.put("topTenCutoff", 10);
        return result;
    }

    public List<Map<String, Object>> getTopRestaurantsOfTheWeek() {
        return restaurantRepository.findTop10ByIsApprovedTrueAndIsActiveTrueOrderByPointsDescIdAsc()
                .stream()
                .map(this::buildRestaurantCardWithPoints)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> filterRestaurants(String craving, String budgetStr, List<Long> tagIds) {
        BudgetRange budgetRange = mapBudgetString(budgetStr);

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

        if (tagIds != null && !tagIds.isEmpty()) {
            List<Restaurant> tagFiltered = filterByTags(candidates, tagIds);
            if (!tagFiltered.isEmpty()) {
                candidates = tagFiltered;
            }
        }

        if (candidates.isEmpty() && craving != null && !craving.trim().isEmpty()) {
            for (String similar : getSimilarCuisines(craving)) {
                candidates = restaurantRepository.findBySpecialityName(similar);
                if (!candidates.isEmpty()) {
                    break;
                }
            }
        }

        return candidates.stream().map(this::buildRestaurantCard).collect(Collectors.toList());
    }

    public Map<String, Object> selectRestaurant(Long userId, Long restaurantId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Visits visit = Visits.builder()
                .user(user)
                .restaurant(restaurant)
                .mode("INDIVIDUAL")
                .confirmedByRestaurant(false)
                .build();
        visitsRepository.save(visit);

        notificationRepository.save(Notification.builder()
                .userId(restaurantId)
                .message(user.getFirstName() + " " + user.getLastName() + " (@" + user.getUsername() + ") is visiting your restaurant!")
                .type("RESTAURANT_ARRIVAL")
                .build());

        return Map.of(
                "message", "Restaurant selected! A notification has been sent.",
                "visitId", visit.getId(),
                "restaurantName", restaurant.getName(),
                "phone", restaurant.getPhone(),
                "locationLink", restaurant.getLocationLink()
        );
    }

    public Map<String, String> rateVisit(Long userId, Long restaurantId, Integer ratingValue) {
        if (ratingValue < 1 || ratingValue > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Rating rating = ratingRepository.findByUserUserIdAndRestaurantId(userId, restaurantId).orElse(new Rating());
        rating.setUser(user);
        rating.setRestaurant(restaurant);
        rating.setRatingValue(ratingValue);
        ratingRepository.save(rating);

        List<Visits> visits = visitsRepository.findByUserUserIdAndMode(userId, "INDIVIDUAL");
        visits.stream()
                .filter(v -> v.getRestaurant().getId().equals(restaurantId) && v.getRatingGiven() == null)
                .findFirst()
                .ifPresent(v -> {
                    v.setRatingGiven(ratingValue);
                    visitsRepository.save(v);
                });

        return Map.of("message", "Rating submitted successfully");
    }

    private Map<String, Object> mapVisit(Visits visit) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("visitId", visit.getId());
        item.put("username", visit.getUser().getUsername());
        item.put("firstName", visit.getUser().getFirstName());
        item.put("lastName", visit.getUser().getLastName());
        item.put("mode", visit.getMode());
        item.put("visitDate", visit.getVisitDate());
        item.put("confirmedByRestaurant", visit.getConfirmedByRestaurant());
        return item;
    }

    private List<Restaurant> filterByTags(List<Restaurant> candidates, List<Long> tagIds) {
        return candidates.stream()
                .filter(r -> r.getTags() != null && r.getTags().stream().anyMatch(tag -> tagIds.contains(tag.getId())))
                .collect(Collectors.toList());
    }

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

    private Map<String, Object> buildRestaurantCard(Restaurant restaurant) {
        Map<String, Object> card = new LinkedHashMap<>();
        card.put("restaurantId", restaurant.getId());
        card.put("id", restaurant.getId());
        card.put("name", restaurant.getName());
        card.put("description", restaurant.getDescription());
        card.put("phone", restaurant.getPhone());
        card.put("address", restaurant.getAddress());
        card.put("locationLink", restaurant.getLocationLink());
        card.put("budgetRange", mapBudgetToString(restaurant.getBudgetRange()));
        card.put("image1Path", restaurant.getImage1Path());
        card.put("image2Path", restaurant.getImage2Path());

        List<Rating> ratings = ratingRepository.findByRestaurantId(restaurant.getId());
        if (!ratings.isEmpty()) {
            double avg = ratings.stream().mapToInt(Rating::getRatingValue).average().orElse(0);
            card.put("averageRating", Math.round(avg * 10.0) / 10.0);
            card.put("totalRatings", ratings.size());
        } else {
            card.put("averageRating", "New");
            card.put("totalRatings", 0);
        }

        card.put("tags", restaurant.getTags() != null
                ? restaurant.getTags().stream().map(Tag::getTagName).collect(Collectors.toList())
                : Collections.emptyList());
        card.put("specialties", restaurant.getSpecialities() != null
                ? restaurant.getSpecialities().stream().map(Speciality::getName).collect(Collectors.toList())
                : Collections.emptyList());

        return card;
    }

    private Map<String, Object> buildRestaurantCardWithPoints(Restaurant restaurant) {
        Map<String, Object> card = buildRestaurantCard(restaurant);
        card.put("points", restaurant.getPoints() != null ? restaurant.getPoints() : 0);
        return card;
    }

    private BudgetRange mapBudgetString(String budget) {
        if (budget == null || budget.isEmpty()) {
            return null;
        }
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

    private String mapBudgetToString(BudgetRange range) {
        if (range == null) {
            return "";
        }
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
