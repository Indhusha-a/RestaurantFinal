package com.restaurant.demo.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "tags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id")
    private Long id;

    @Column(nullable = false, unique = true)
    private String tagName;

    private String tagDescription;

    // Reverse mapping
    @ManyToMany(mappedBy = "tags")
    private Set<Restaurant> restaurants;
}