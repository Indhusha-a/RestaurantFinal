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
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;


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
                .isApproved(false)
                .isActive(true)
                .points(0)
                .boostRequested(false)
                .approvedAt(null)
                .build();

        return restaurantRepository.save(restaurant);
    }

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAllByOrderByIdDesc();
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

}