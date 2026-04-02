
package com.restaurant.demo.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.demo.Entity.Group;
import com.restaurant.demo.Entity.User;

public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByCreatedBy(User createdBy);
}