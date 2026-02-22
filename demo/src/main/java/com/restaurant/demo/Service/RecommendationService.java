package com.restaurant.demo.Service;

import com.restaurant.demo.Dto.CfRequest;
import com.restaurant.demo.Dto.CfResponse;
import com.restaurant.demo.Entity.Rating;
import com.restaurant.demo.Entity.Restaurant;
import com.restaurant.demo.Repository.RatingRepository;
import com.restaurant.demo.Repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RatingRepository ratingRepository;
    private final RestaurantRepository restaurantRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<Restaurant> getRecommendations(Long userId) {

        List<Rating> allRatings = ratingRepository.findAll();

        // Convert ratings to DTO format
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

        // Call Python service
        String pythonUrl = "http://localhost:8000/recommend";

        CfResponse response = restTemplate.postForObject(
                pythonUrl,
                request,
                CfResponse.class
        );

        if (response == null || response.getRecommendedRestaurantIds() == null) {
            return List.of();
        }

        // Fetch restaurant details
        return restaurantRepository.findAllById(response.getRecommendedRestaurantIds());
    }
}