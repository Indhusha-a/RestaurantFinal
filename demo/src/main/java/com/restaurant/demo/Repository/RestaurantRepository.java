package com.restaurant.demo.Repository;

import com.restaurant.demo.Entity.Restaurant;
import com.restaurant.demo.enums.BudgetRange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    // ==================== INDIVIDUAL MODE QUERIES ====================

    // Only approved and active restaurants are visible to users
    List<Restaurant> findByIsApprovedTrueAndIsActiveTrue();

    // Filter by budget range
    List<Restaurant> findByIsApprovedTrueAndIsActiveTrueAndBudgetRange(BudgetRange budgetRange);

    // Find restaurants that have a specific speciality name (for craving match)
    @Query("SELECT DISTINCT r FROM Restaurant r JOIN r.specialities s " +
            "WHERE r.isApproved = true AND r.isActive = true " +
            "AND LOWER(s.name) = LOWER(:specialityName)")
    List<Restaurant> findBySpecialityName(@Param("specialityName") String specialityName);

    // Find restaurants that have a specific speciality and budget range
    @Query("SELECT DISTINCT r FROM Restaurant r JOIN r.specialities s " +
            "WHERE r.isApproved = true AND r.isActive = true " +
            "AND LOWER(s.name) = LOWER(:specialityName) AND r.budgetRange = :budgetRange")
    List<Restaurant> findBySpecialityNameAndBudget(
            @Param("specialityName") String specialityName,
            @Param("budgetRange") BudgetRange budgetRange);

    // Recently approved restaurants for Explore Mode (Member 2 can use this)
    List<Restaurant> findByIsApprovedTrueOrderByApprovedAtDesc();
}