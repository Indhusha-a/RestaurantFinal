package com.restaurant.demo.Repository;

import com.restaurant.demo.Entity.Speciality;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpecialityRepository extends JpaRepository<Speciality, Long> {
}