package com.restaurant.demo.Service;

import com.restaurant.demo.Dto.AdminRestaurantRequest;
import com.restaurant.demo.Dto.TopsisRankedRestaurantDto;
import com.restaurant.demo.Dto.TopsisResponseDto;
import com.restaurant.demo.Entity.GroupSession;
import com.restaurant.demo.Entity.Rating;
import com.restaurant.demo.Entity.Restaurant;
import com.restaurant.demo.Entity.User;
import com.restaurant.demo.Entity.Visits;
import com.restaurant.demo.Repository.GroupSessionRepository;
import com.restaurant.demo.Repository.RatingRepository;
import com.restaurant.demo.Repository.RestaurantRepository;
import com.restaurant.demo.Repository.UserRepository;
import com.restaurant.demo.Repository.VisitsRepository;
import com.restaurant.demo.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Calendar;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final GroupSessionRepository groupSessionRepository;
    private final RatingRepository ratingRepository;
    private final VisitsRepository visitsRepository;
    private final GroupService groupService;

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
                .isRejected(false)
                .points(0)
                .boostRequested(false)
                .approvalStatus("APPROVED")
                .rejectionReason(null)
                .approvedAt(LocalDateTime.now())
                .build();

        return restaurantRepository.save(restaurant);
    }

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(Restaurant::getId).reversed())
                .collect(Collectors.toList());
    }

    public List<Restaurant> getPendingRestaurants() {
        return restaurantRepository.findAll()
                .stream()
                .filter(restaurant -> "PENDING".equalsIgnoreCase(restaurant.getApprovalStatus()))
                .sorted(Comparator.comparing(Restaurant::getId).reversed())
                .collect(Collectors.toList());
    }

    public Restaurant approveRestaurant(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        restaurant.setIsApproved(true);
        restaurant.setIsRejected(false);
        restaurant.setIsActive(true);
        restaurant.setApprovalStatus("APPROVED");
        restaurant.setRejectionReason(null);
        restaurant.setApprovedAt(LocalDateTime.now());

        return restaurantRepository.save(restaurant);
    }

    public Restaurant rejectRestaurant(Long restaurantId, String reason) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        restaurant.setIsApproved(false);
        restaurant.setIsRejected(true);
        restaurant.setApprovalStatus("REJECTED");
        restaurant.setRejectionReason(reason);
        restaurant.setApprovedAt(null);

        return restaurantRepository.save(restaurant);
    }

    public List<Restaurant> getRejectedRestaurants() {
        return restaurantRepository.findAll()
                .stream()
                .filter(restaurant -> "REJECTED".equalsIgnoreCase(restaurant.getApprovalStatus()))
                .sorted(Comparator.comparing(Restaurant::getId).reversed())
                .collect(Collectors.toList());
    }

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

    public void approveUserDeletion(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.USER) {
            throw new RuntimeException("Only normal users can be deleted from this section");
        }

        user.setIsActive(false);
        user.setDeletionRequested(false);

        userRepository.save(user);
    }

    public Map<String, Object> getDashboardStats() {
        long totalUsers = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.USER)
                .count();

        long activeUsers = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.USER && Boolean.TRUE.equals(user.getIsActive()))
                .count();

        long totalRestaurants = restaurantRepository.count();
        long pendingRestaurants = restaurantRepository.findAll().stream()
                .filter(restaurant -> "PENDING".equalsIgnoreCase(restaurant.getApprovalStatus()))
                .count();
        long approvedRestaurants = restaurantRepository.findAll().stream()
                .filter(restaurant -> "APPROVED".equalsIgnoreCase(restaurant.getApprovalStatus()))
                .count();
        long rejectedRestaurants = restaurantRepository.findAll().stream()
                .filter(restaurant -> "REJECTED".equalsIgnoreCase(restaurant.getApprovalStatus()))
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

    public Map<String, Object> getSystemActivityMetrics() {
        long totalRegisteredUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.USER).count();

        long currentlyActiveUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.USER && Boolean.TRUE.equals(u.getIsActive())).count();

        long totalRegisteredRestaurants = restaurantRepository.count();
        long activeGroupSessions = groupSessionRepository.countByStatusIgnoreCase("OPEN");
        long completedGroupSessions = groupSessionRepository.countByStatusIgnoreCase("CLOSED");

        Map<String, Object> activity = new LinkedHashMap<>();
        activity.put("totalRegisteredUsers", totalRegisteredUsers);
        activity.put("currentlyActiveUsers", currentlyActiveUsers);
        activity.put("activeGroupSessions", activeGroupSessions);
        activity.put("totalRegisteredRestaurants", totalRegisteredRestaurants);
        activity.put("completedGroupSessions", completedGroupSessions);

        return activity;
    }

    public List<Map<String, Object>> getMonthlyGrowthTrends() {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        List<Map<String, Object>> trends = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

        for (int i = 0; i < 6; i++) {
            int monthNum = 1 + (Calendar.getInstance().get(Calendar.MONTH) - 5 + i + 12) % 12;
            String monthLabel = months[monthNum - 1];
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("label", monthLabel);
            point.put("restaurants", restaurants.stream()
                    .filter(r -> r.getApprovedAt() != null && r.getApprovedAt().getMonthValue() == monthNum)
                    .count());
            trends.add(point);
        }

        return trends;
    }

    public Map<String, Object> getTopsisMetrics() {
        List<GroupSession> closedSessions = groupSessionRepository.findByStatusIgnoreCase("CLOSED").stream()
                .filter(session -> session.getWinningRestaurant() != null)
                .sorted(Comparator.comparing(GroupSession::getCreatedAt))
                .collect(Collectors.toList());

        if (closedSessions.isEmpty()) {
            return Map.of(
                    "rank1SuccessRate", 0.0,
                    "top3ContainmentRate", 0.0,
                    "groupSatisfactionTrend", "Not enough data",
                    "confirmedVisitRate", 0.0,
                    "outcomeDistribution", Map.of(),
                    "analysisCoverage", 0
            );
        }

        int analyzedSessions = 0;
        int rank1Wins = 0;
        int top3Wins = 0;
        Map<String, Integer> outcomeDistribution = new LinkedHashMap<>();
        List<Double> olderScores = new ArrayList<>();
        List<Double> recentScores = new ArrayList<>();

        for (int index = 0; index < closedSessions.size(); index++) {
            GroupSession session = closedSessions.get(index);
            try {
                TopsisResponseDto response = groupService.generateTopsisRecommendations(session.getId());
                if (response == null || response.getResults() == null) {
                    continue;
                }

                Optional<TopsisRankedRestaurantDto> match = response.getResults().stream()
                        .filter(item -> Objects.equals(item.getRestaurant_id(), session.getWinningRestaurant().getId()))
                        .findFirst();

                if (match.isEmpty()) {
                    continue;
                }

                analyzedSessions++;
                int rank = match.get().getRank() == null ? -1 : match.get().getRank();
                if (rank == 1) {
                    rank1Wins++;
                }
                if (rank > 0 && rank <= 3) {
                    top3Wins++;
                }

                outcomeDistribution.merge(rank > 0 ? "Rank " + rank : "Unranked", 1, Integer::sum);

                Double groupMatch = match.get().getGroup_match_percentage();
                if (groupMatch != null) {
                    if (index < closedSessions.size() / 2) {
                        olderScores.add(groupMatch);
                    } else {
                        recentScores.add(groupMatch);
                    }
                }
            } catch (RuntimeException ex) {
                // Keep analytics resilient even if the external TOPSIS service is unavailable.
            }
        }

        double confirmedVisitRate = percentage(
                closedSessions.stream()
                        .filter(session -> Boolean.TRUE.equals(session.getRestaurantConfirmed()) && Boolean.TRUE.equals(session.getLeaderConfirmed()))
                        .count(),
                closedSessions.size()
        );

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("rank1SuccessRate", percentage(rank1Wins, analyzedSessions));
        metrics.put("top3ContainmentRate", percentage(top3Wins, analyzedSessions));
        metrics.put("groupSatisfactionTrend", deriveTrend(olderScores, recentScores));
        metrics.put("confirmedVisitRate", confirmedVisitRate);
        metrics.put("outcomeDistribution", outcomeDistribution);
        metrics.put("analysisCoverage", analyzedSessions);
        return metrics;
    }

    public Map<String, Object> getCfMetrics() {
        List<Rating> ratings = ratingRepository.findAll();
        List<Visits> confirmedIndividualVisits = visitsRepository.findAll().stream()
                .filter(visit -> "INDIVIDUAL".equalsIgnoreCase(visit.getMode()))
                .filter(visit -> Boolean.TRUE.equals(visit.getConfirmedByRestaurant()))
                .collect(Collectors.toList());

        long ratedConfirmedVisits = confirmedIndividualVisits.stream()
                .filter(visit -> visit.getRatingGiven() != null)
                .count();

        double averageObservedRating = ratings.stream()
                .mapToInt(Rating::getRatingValue)
                .average()
                .orElse(0.0);

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("engagementRate", percentage(ratedConfirmedVisits, confirmedIndividualVisits.size()));
        metrics.put("ratingPredictionAccuracy", percentage(ratings.size(), Math.max(1, confirmedIndividualVisits.size())));
        metrics.put("interactionCount", confirmedIndividualVisits.size() + ratings.size());
        metrics.put("improvementTrend", deriveRecentActivityTrend(ratings));
        metrics.put("metricMode", "observed");
        metrics.put("averageObservedRating", Math.round(averageObservedRating * 10.0) / 10.0);
        return metrics;
    }

    private double percentage(long numerator, long denominator) {
        if (denominator <= 0) {
            return 0.0;
        }
        return Math.round((numerator * 10000.0) / denominator) / 100.0;
    }

    private String deriveTrend(List<Double> olderScores, List<Double> recentScores) {
        if (olderScores.isEmpty() || recentScores.isEmpty()) {
            return "Not enough data";
        }

        double olderAverage = olderScores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double recentAverage = recentScores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

        if (recentAverage > olderAverage + 2.0) {
            return "Increasing";
        }
        if (recentAverage < olderAverage - 2.0) {
            return "Declining";
        }
        return "Stable";
    }

    private String deriveRecentActivityTrend(List<Rating> ratings) {
        if (ratings.isEmpty()) {
            return "Not enough data";
        }

        LocalDateTime now = LocalDateTime.now();
        long recentWindow = ratings.stream()
                .filter(rating -> rating.getCreatedAt() != null && ChronoUnit.DAYS.between(rating.getCreatedAt(), now) <= 30)
                .count();
        long previousWindow = ratings.stream()
                .filter(rating -> rating.getCreatedAt() != null)
                .filter(rating -> {
                    long days = ChronoUnit.DAYS.between(rating.getCreatedAt(), now);
                    return days > 30 && days <= 60;
                })
                .count();

        if (recentWindow > previousWindow) {
            return "Growing";
        }
        if (recentWindow < previousWindow) {
            return "Cooling";
        }
        return "Stable";
    }
}
