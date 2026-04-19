package com.restaurant.demo.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "visits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Visits {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    private LocalDateTime visitDate;

    private String mode; // INDIVIDUAL or GROUP

    private Integer ratingGiven; // nullable, 1-5 rating after visit

    @Builder.Default
    private Boolean confirmedByRestaurant = false;

    @PrePersist
    protected void onCreate() {
        this.visitDate = LocalDateTime.now();
    }
}
