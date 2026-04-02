package com.restaurant.demo.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.demo.Entity.GroupSession;
import com.restaurant.demo.Entity.User;
import com.restaurant.demo.Entity.Vote;

public interface VoteRepository extends JpaRepository<Vote, Long> {
    List<Vote> findBySession(GroupSession session);
    Optional<Vote> findBySessionAndUser(GroupSession session, User user);
}