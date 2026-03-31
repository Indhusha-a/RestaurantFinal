package com.restaurant.demo.Service;

import com.restaurant.demo.Entity.Speciality;
import com.restaurant.demo.Repository.SpecialityRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpecialityService {

    private final SpecialityRepository specialityRepository;

    private static final List<String> MAIN_SPECIALITIES = List.of(
            "Pizza", "Pasta", "Kottu", "Fried Rice", "Burger", "Sushi", "Noodles", "Curry",
            "BBQ", "Seafood", "Sandwich", "Salad", "Soup", "Steak", "Tacos", "Dosa",
            "Biryani", "Ramen", "Dim Sum", "Falafel"
    );

    private static final List<String> DESSERT_SPECIALITIES = List.of(
            "Brownies", "Ice Cream", "Cakes", "Pastries", "Pudding",
            "Cheesecake", "Donuts", "Mousse", "Tiramisu", "Gulab Jamun"
    );

    @PostConstruct
    public void seedDefaults() {
        MAIN_SPECIALITIES.forEach(name -> createIfMissing(name, "MAIN"));
        DESSERT_SPECIALITIES.forEach(name -> createIfMissing(name, "DESSERT"));
    }

    public Speciality createSpeciality(Speciality speciality) {
        return specialityRepository.save(speciality);
    }

    public List<Speciality> getAllSpecialities() {
        return specialityRepository.findAll();
    }

    public List<Speciality> getMainSpecialities() {
        return specialityRepository.findByCategoryIgnoreCase("MAIN");
    }

    public List<Speciality> getDessertSpecialities() {
        return specialityRepository.findByCategoryIgnoreCase("DESSERT");
    }

    public Speciality getOrCreate(String name, String category) {
        return specialityRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> createSpeciality(Speciality.builder()
                        .name(name)
                        .category(category)
                        .description(category + " speciality")
                        .build()));
    }

    private void createIfMissing(String name, String category) {
        specialityRepository.findByNameIgnoreCase(name).orElseGet(() ->
                specialityRepository.save(Speciality.builder()
                        .name(name)
                        .category(category)
                        .description(category + " speciality")
                        .build()));
    }
}
