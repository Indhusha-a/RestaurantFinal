package com.restaurant.demo.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.demo.Dto.CreateGroupRequest;
import com.restaurant.demo.Dto.InviteUserByUsernameRequest;
import com.restaurant.demo.Dto.RespondInvitationRequest;
import com.restaurant.demo.Dto.StartSessionRequest;
import com.restaurant.demo.Dto.SubmitPreferenceRequest;
import com.restaurant.demo.Dto.TopsisResponseDto;
import com.restaurant.demo.Dto.UserSearchResponse;
import com.restaurant.demo.Dto.VoteRequest;
import com.restaurant.demo.Entity.Group;
import com.restaurant.demo.Entity.GroupInvitation;
import com.restaurant.demo.Entity.GroupMember;
import com.restaurant.demo.Entity.GroupSession;
import com.restaurant.demo.Entity.SessionPreference;
import com.restaurant.demo.Entity.Vote;
import com.restaurant.demo.Service.GroupService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class GroupController {

    private final GroupService groupService;

    @PostMapping("/create")
    public ResponseEntity<Group> createGroup(@RequestBody CreateGroupRequest request) {
        return ResponseEntity.ok(groupService.createGroup(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Group>> getGroupsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(groupService.getGroupsByUser(userId));
    }

    @PostMapping("/invite-by-username")
    public ResponseEntity<GroupInvitation> inviteUserByUsername(@RequestBody InviteUserByUsernameRequest request) {
        return ResponseEntity.ok(groupService.inviteUserByUsername(request));
    }

    @PostMapping("/invitation/respond")
    public ResponseEntity<GroupInvitation> respondToInvitation(@RequestBody RespondInvitationRequest request) {
        return ResponseEntity.ok(groupService.respondToInvitation(request));
    }

    @GetMapping("/invitations/{userId}")
    public ResponseEntity<List<GroupInvitation>> getInvitationsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(groupService.getInvitationsForUser(userId));
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<GroupMember>> getMembersByGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getMembersByGroup(groupId));
    }

    @PostMapping("/session/start")
    public ResponseEntity<GroupSession> startSession(@RequestBody StartSessionRequest request) {
        return ResponseEntity.ok(groupService.startSession(request));
    }

    @PostMapping("/session/preference")
    public ResponseEntity<SessionPreference> submitPreference(@RequestBody SubmitPreferenceRequest request) {
        return ResponseEntity.ok(groupService.submitPreference(request));
    }

    @PostMapping("/session/vote")
    public ResponseEntity<Vote> submitVote(@RequestBody VoteRequest request) {
        return ResponseEntity.ok(groupService.submitVote(request));
    }

    @GetMapping("/session/{sessionId}/results")
    public ResponseEntity<Map<String, Object>> getSessionResults(@PathVariable Long sessionId) {
        return ResponseEntity.ok(groupService.getSessionResults(sessionId));
    }









    @GetMapping("/search-users")
    public ResponseEntity<List<UserSearchResponse>> searchUsersForInvite(   
            @RequestParam Long groupId,
            @RequestParam String username,
            @RequestParam Long currentUserId) {
        return ResponseEntity.ok(groupService.searchUsersForInvite(groupId, username, currentUserId));
    }




    @GetMapping("/session/{sessionId}/topsis")
        public ResponseEntity<TopsisResponseDto> generateTopsisRecommendations(@PathVariable Long sessionId) {
        return ResponseEntity.ok(groupService.generateTopsisRecommendations(sessionId));
    }
}