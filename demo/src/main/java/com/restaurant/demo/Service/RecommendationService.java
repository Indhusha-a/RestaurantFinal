package com.restaurant.demo.Service;

import com.restaurant.demo.Dto.CfRequest;
import com.restaurant.demo.Dto.CfResponse;
import com.restaurant.demo.Entity.Rating;
import com.restaurant.demo.Entity.Restaurant;
import com.restaurant.demo.Repository.RatingRepository;
import com.restaurant.demo.Repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RatingRepository ratingRepository;
    private final RestaurantRepository restaurantRepository;

    // RestTemplate is used to make HTTP calls to the Python Collaborative Filtering engine
    private final RestTemplate restTemplate = new RestTemplate();

    // ==================== COLLABORATIVE FILTERING ====================

    // Gathers all existing user ratings in the system and sends them to the
    // Python CF engine (running on port 8000). The Python engine uses this
    // data to figure out which restaurants the target user is likely to enjoy.
    // If the Python server is not running, an empty list is returned safely
    // so that Explore Mode does not crash.
    public List<Restaurant> getRecommendations(Long userId) {

        List<Rating> allRatings = ratingRepository.findAll();

        // Convert ratings to the DTO format expected by the Python CF service
        List<CfRequest.RatingDTO> ratingDTOs = allRatings.stream().map(r -> {
            CfRequest.RatingDTO dto = new CfRequest.RatingDTO();
            dto.setUserId(r.getUser().getUserId());
            dto.setRestaurantId(r.getRestaurant().getId());
            dto.setRatingValue(r.getRatingValue());
            return dto;
        }).collect(Collectors.toList());

        CfRequest request = new CfRequest();
        request.setUserId(userId);
        request.setRatings(ratingDTOs);

        // Python Collaborative Filtering service endpoint
        String pythonUrl = "http://localhost:8000/recommend";

        try {
            CfResponse response = restTemplate.postForObject(
                    pythonUrl,
                    request,
                    CfResponse.class
            );

            if (response == null || response.getRecommendedRestaurantIds() == null) {
                return List.of();
            }

            // Fetch and return restaurant details for each recommended ID
            return restaurantRepository.findAllById(response.getRecommendedRestaurantIds());

        } catch (RestClientException e) {
            // Python service is either not running or unreachable
            // Return empty list so Explore Mode loads the weekly leaderboard normally
            return List.of();
        }
    }
}