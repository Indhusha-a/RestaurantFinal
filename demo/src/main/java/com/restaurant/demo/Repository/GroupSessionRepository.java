package com.restaurant.demo.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.demo.Entity.Group;
import com.restaurant.demo.Entity.GroupSession;

public interface GroupSessionRepository extends JpaRepository<GroupSession, Long> {
    List<GroupSession> findByGroup(Group group);

    List<GroupSession> findByWinningRestaurantIdOrderByCreatedAtDesc(Long restaurantId);

    Optional<GroupSession> findFirstByWinningRestaurantIdOrderByCreatedAtDesc(Long restaurantId);

    long countByStatusIgnoreCase(String status);

    List<GroupSession> findByStatusIgnoreCase(String status);
}
