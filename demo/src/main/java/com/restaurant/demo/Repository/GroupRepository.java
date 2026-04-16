
package com.restaurant.demo.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.restaurant.demo.Entity.Group;
import com.restaurant.demo.Entity.User;

public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByCreatedBy(User createdBy);

    // Fetch top 10 groups by points for weekly leaderboard
    @Query(value = "SELECT * FROM restaurant_groups WHERE is_active = true ORDER BY points DESC LIMIT 10", nativeQuery = true)
    List<Group> findTop10ByIsActiveTrueOrderByPointsDesc();
}