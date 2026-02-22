package com.restaurant.demo.Entity;

import com.restaurant.demo.enums.Category;
import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "specialities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Speciality {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "speciality_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;  // MAIN or DESSERT

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    // Reverse mapping (optional)
    @ManyToMany(mappedBy = "specialities")
    private Set<Restaurant> restaurants;
}