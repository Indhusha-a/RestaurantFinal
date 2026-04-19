package com.restaurant.demo.Repository;

import com.restaurant.demo.Entity.Speciality;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpecialityRepository extends JpaRepository<Speciality, Long> {
    Optional<Speciality> findByNameIgnoreCase(String name);
    List<Speciality> findByCategoryIgnoreCase(String category);
}
