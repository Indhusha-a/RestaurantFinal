package com.restaurant.demo.Repository;

import com.restaurant.demo.Entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, Long> {
}