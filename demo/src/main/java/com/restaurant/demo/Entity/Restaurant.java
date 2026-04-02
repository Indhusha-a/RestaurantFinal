package com.restaurant.demo.Entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
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

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "image_url")
private String imageUrl;

    private String locationLink;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BudgetRange budgetRange;

    private String menuPdfPath;
    private String image1Path;
    private String image2Path;

    private Boolean isApproved = false;
    private Boolean isActive = true;
    private Boolean isRejected = false;
    private String approvalStatus = "PENDING";
    private String rejectionReason;

    private Integer points = 0;
    private Boolean boostRequested = false;

    private LocalDateTime approvedAt;

   //Relationships

    @ManyToMany
    @JoinTable(
            name = "restaurant_tags",
            joinColumns = @JoinColumn(name = "restaurant_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @JsonIgnore
private Set<Tag> tags;

    @ManyToMany
    @JoinTable(
            name = "restaurant_specialities",
            joinColumns = @JoinColumn(name = "restaurant_id"),
            inverseJoinColumns = @JoinColumn(name = "speciality_id")
    )
    @JsonIgnore
private Set<Speciality> specialities;
}
