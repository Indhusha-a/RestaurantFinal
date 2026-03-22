package com.restaurant.demo.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.demo.Entity.Group;
import com.restaurant.demo.Entity.GroupInvitation;
import com.restaurant.demo.Entity.User;

public interface GroupInvitationRepository extends JpaRepository<GroupInvitation, Long> {
    List<GroupInvitation> findByInvitedUser(User invitedUser);
    List<GroupInvitation> findByGroup(Group group);
    Optional<GroupInvitation> findByGroupAndInvitedUser(Group group, User invitedUser);
}