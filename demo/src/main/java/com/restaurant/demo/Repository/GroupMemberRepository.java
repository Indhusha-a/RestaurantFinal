package com.restaurant.demo.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.demo.Entity.Group;
import com.restaurant.demo.Entity.GroupMember;
import com.restaurant.demo.Entity.User;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroup(Group group);
    List<GroupMember> findByUser(User user);
    Optional<GroupMember> findByGroupAndUser(Group group, User user);
}