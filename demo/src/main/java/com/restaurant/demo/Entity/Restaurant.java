package com.restaurant.demo.Entity;

import com.restaurant.demo.enums.BudgetRange;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "restaurants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "restaurant_id")
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String locationLink;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BudgetRange budgetRange;

    private String menuPdfPath;
    private String image1Path;
    private String image2Path;

    private Boolean isApproved = false;
    private Boolean isActive = true;

    private Integer points = 0;
    private Boolean boostRequested = false;

    // 🔹 Current status of restaurant (PENDING / APPROVED / REJECTED)
    private String status = "PENDING";

    // 🔹 If rejected, admin reason will be stored here
    private String rejectionReason;

    private LocalDateTime approvedAt;


   //Relationships

    @ManyToMany
    @JoinTable(
            name = "restaurant_tags",
            joinColumns = @JoinColumn(name = "restaurant_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags;

    @ManyToMany
    @JoinTable(
            name = "restaurant_specialities",
            joinColumns = @JoinColumn(name = "restaurant_id"),
            inverseJoinColumns = @JoinColumn(name = "speciality_id")
    )
    private Set<Speciality> specialities;

}