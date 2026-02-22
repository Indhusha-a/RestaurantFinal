package com.restaurant.demo.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "ratings",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"user_id", "restaurant_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(nullable = false)
    private Integer ratingValue; // 1 to 5
}