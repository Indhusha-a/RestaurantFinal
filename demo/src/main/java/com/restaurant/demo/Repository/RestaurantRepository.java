package com.restaurant.demo.Repository;
import com.restaurant.demo.Entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {


}