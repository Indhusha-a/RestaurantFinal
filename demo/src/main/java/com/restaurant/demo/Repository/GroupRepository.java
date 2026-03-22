// package com.restaurant.demo.Repository;

// import com.restaurant.demo.Entity.Group;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

// @Repository
// public interface GroupRepository extends JpaRepository<Group, Long> {
// }



package com.restaurant.demo.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.demo.Entity.Group;
import com.restaurant.demo.Entity.User;

public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByCreatedBy(User createdBy);
}