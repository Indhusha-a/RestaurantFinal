package com.restaurant.demo.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.demo.Entity.GroupSession;
import com.restaurant.demo.Entity.SessionPreference;
import com.restaurant.demo.Entity.User;

public interface SessionPreferenceRepository extends JpaRepository<SessionPreference, Long> {
    List<SessionPreference> findBySession(GroupSession session);
    Optional<SessionPreference> findBySessionAndUser(GroupSession session, User user);
}