package com.restaurant.demo.Repository;

import com.restaurant.demo.Entity.Visits;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VisitsRepository extends JpaRepository<Visits, Long> {

    List<Visits> findByUserUserIdOrderByVisitDateDesc(Long userId);

    List<Visits> findByUserUserIdAndMode(Long userId, String mode);
}
