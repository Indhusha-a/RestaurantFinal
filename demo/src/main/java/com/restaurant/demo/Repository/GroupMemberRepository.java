package com.restaurant.demo.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.restaurant.demo.Entity.Group;
import com.restaurant.demo.Entity.GroupMember;
import com.restaurant.demo.Entity.User;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByGroup(Group group);
    List<GroupMember> findByUser(User user);
    Optional<GroupMember> findByGroupAndUser(Group group, User user);

    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.id = :groupId")
    List<GroupMember> findByGroupId(@Param("groupId") Long groupId);
}