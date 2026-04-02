package com.restaurant.demo.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.demo.Entity.Group;
import com.restaurant.demo.Entity.GroupSession;

public interface GroupSessionRepository extends JpaRepository<GroupSession, Long> {
    List<GroupSession> findByGroup(Group group);
}