package com.restaurant.demo.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.restaurant.demo.Dto.CreateGroupRequest;
import com.restaurant.demo.Dto.InviteUserByUsernameRequest;
import com.restaurant.demo.Dto.RespondInvitationRequest;
import com.restaurant.demo.Dto.StartSessionRequest;
import com.restaurant.demo.Dto.SubmitPreferenceRequest;
import com.restaurant.demo.Dto.TopsisPreferenceDto;
import com.restaurant.demo.Dto.TopsisRequestDto;
import com.restaurant.demo.Dto.TopsisResponseDto;
import com.restaurant.demo.Dto.TopsisRestaurantDto;
import com.restaurant.demo.Dto.UserSearchResponse;
import com.restaurant.demo.Dto.VoteRequest;
import com.restaurant.demo.Entity.Group;
import com.restaurant.demo.Entity.GroupInvitation;
import com.restaurant.demo.Entity.GroupMember;
import com.restaurant.demo.Entity.GroupSession;
import com.restaurant.demo.Entity.Restaurant;
import com.restaurant.demo.Entity.SessionPreference;
import com.restaurant.demo.Entity.SessionPreferenceTag;
import com.restaurant.demo.Entity.Tag;
import com.restaurant.demo.Entity.User;
import com.restaurant.demo.Entity.Vote;
import com.restaurant.demo.Repository.GroupInvitationRepository;
import com.restaurant.demo.Repository.GroupMemberRepository;
import com.restaurant.demo.Repository.GroupRepository;
import com.restaurant.demo.Repository.GroupSessionRepository;
import com.restaurant.demo.Repository.RestaurantRepository;
import com.restaurant.demo.Repository.SessionPreferenceRepository;
import com.restaurant.demo.Repository.SessionPreferenceTagRepository;
import com.restaurant.demo.Repository.TagRepository;
import com.restaurant.demo.Repository.UserRepository;
import com.restaurant.demo.Repository.VoteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupInvitationRepository groupInvitationRepository;
    private final GroupSessionRepository groupSessionRepository;
    private final SessionPreferenceRepository sessionPreferenceRepository;
    private final SessionPreferenceTagRepository sessionPreferenceTagRepository;
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final TagRepository tagRepository;

    

    public Group createGroup(CreateGroupRequest request) {
        User creator = userRepository.findById(request.getCreatedByUserId())
                .orElseThrow(() -> new RuntimeException("Creator user not found"));

        List<Group> createdGroups = groupRepository.findByCreatedBy(creator);
        if (!createdGroups.isEmpty()) {
            throw new RuntimeException("A user can create only one group");
        }

        Group group = Group.builder()
                .groupName(request.getGroupName())
                .createdBy(creator)
                .createdAt(LocalDateTime.now())
                .isActive(true)
                .build();

        Group savedGroup = groupRepository.save(group);

        GroupMember leaderMember = GroupMember.builder()
                .group(savedGroup)
                .user(creator)
                .joinedAt(LocalDateTime.now())
                .role("LEADER")
                .status("ACTIVE")
                .build();

        groupMemberRepository.save(leaderMember);

        return savedGroup;
    }

    public List<Group> getGroupsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<GroupMember> memberships = groupMemberRepository.findByUser(user);

        List<Group> groups = new ArrayList<>();
        for (GroupMember membership : memberships) {
            if ("ACTIVE".equalsIgnoreCase(membership.getStatus())) {
                groups.add(membership.getGroup());
            }
        }
        return groups;
    }

    public GroupInvitation inviteUserByUsername(InviteUserByUsernameRequest request) {
        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User invitedByUser = userRepository.findById(request.getInvitedByUserId())
                .orElseThrow(() -> new RuntimeException("Inviting user not found"));

        Optional<GroupMember> inviterMembership = groupMemberRepository.findByGroupAndUser(group, invitedByUser);
        if (inviterMembership.isEmpty() || !"ACTIVE".equalsIgnoreCase(inviterMembership.get().getStatus())) {
            throw new RuntimeException("Inviting user is not an active member of this group");
        }

        if (!"LEADER".equalsIgnoreCase(inviterMembership.get().getRole())) {
            throw new RuntimeException("Only the group leader can invite users");
        }

        User invitedUser = userRepository.findByUsername(request.getInvitedUsername())
                .orElseThrow(() -> new RuntimeException("Invited username not found"));

        if (invitedUser.getUserId().equals(invitedByUser.getUserId())) {
            throw new RuntimeException("Leader cannot invite themselves");
        }

        Optional<GroupMember> existingMember = groupMemberRepository.findByGroupAndUser(group, invitedUser);
        if (existingMember.isPresent()) {
            throw new RuntimeException("User is already a member of this group");
        }

        List<GroupMember> currentMembers = groupMemberRepository.findByGroup(group);
        long activeCount = currentMembers.stream()
                .filter(m -> "ACTIVE".equalsIgnoreCase(m.getStatus()))
                .count();

        if (activeCount >= 5) {
            throw new RuntimeException("Group already has maximum 5 members");
        }

        List<GroupMember> invitedUserMemberships = groupMemberRepository.findByUser(invitedUser);
        long invitedUserActiveGroups = invitedUserMemberships.stream()
                .filter(m -> "ACTIVE".equalsIgnoreCase(m.getStatus()))
                .count();

        if (invitedUserActiveGroups >= 3) {
            throw new RuntimeException("User is already in maximum 3 groups");
        }

        Optional<GroupInvitation> existingInvitation =
                groupInvitationRepository.findByGroupAndInvitedUser(group, invitedUser);

        if (existingInvitation.isPresent() &&
                "PENDING".equalsIgnoreCase(existingInvitation.get().getStatus())) {
            throw new RuntimeException("Pending invitation already exists for this user");
        }

        GroupInvitation invitation = GroupInvitation.builder()
                .group(group)
                .invitedUser(invitedUser)
                .invitedByUser(invitedByUser)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        return groupInvitationRepository.save(invitation);
    }

    public GroupInvitation respondToInvitation(RespondInvitationRequest request) {
        GroupInvitation invitation = groupInvitationRepository.findById(request.getInvitationId())
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (!"PENDING".equalsIgnoreCase(invitation.getStatus())) {
            throw new RuntimeException("Invitation already responded to");
        }

        String action = request.getAction();
        if (action == null) {
            throw new RuntimeException("Action is required");
        }

        if ("ACCEPT".equalsIgnoreCase(action)) {
            Group group = invitation.getGroup();
            User invitedUser = invitation.getInvitedUser();

            List<GroupMember> currentMembers = groupMemberRepository.findByGroup(group);
            long activeCount = currentMembers.stream()
                    .filter(m -> "ACTIVE".equalsIgnoreCase(m.getStatus()))
                    .count();

            if (activeCount >= 5) {
                throw new RuntimeException("Group already has maximum 5 members");
            }

            List<GroupMember> invitedUserMemberships = groupMemberRepository.findByUser(invitedUser);
            long invitedUserActiveGroups = invitedUserMemberships.stream()
                    .filter(m -> "ACTIVE".equalsIgnoreCase(m.getStatus()))
                    .count();

            if (invitedUserActiveGroups >= 3) {
                throw new RuntimeException("User is already in maximum 3 groups");
            }

            invitation.setStatus("ACCEPTED");
            invitation.setRespondedAt(LocalDateTime.now());

            GroupMember newMember = GroupMember.builder()
                    .group(group)
                    .user(invitedUser)
                    .joinedAt(LocalDateTime.now())
                    .role("MEMBER")
                    .status("ACTIVE")
                    .build();

            groupMemberRepository.save(newMember);

        } else if ("REJECT".equalsIgnoreCase(action)) {
            invitation.setStatus("REJECTED");
            invitation.setRespondedAt(LocalDateTime.now());
        } else {
            throw new RuntimeException("Action must be ACCEPT or REJECT");
        }

        return groupInvitationRepository.save(invitation);
    }

    public List<GroupInvitation> getInvitationsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return groupInvitationRepository.findByInvitedUser(user);
    }

    public List<GroupMember> getMembersByGroup(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        return groupMemberRepository.findByGroup(group);
    }

    public GroupSession startSession(StartSessionRequest request) {
        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User creator = userRepository.findById(request.getCreatedByUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<GroupMember> membership = groupMemberRepository.findByGroupAndUser(group, creator);
        if (membership.isEmpty() || !"ACTIVE".equalsIgnoreCase(membership.get().getStatus())) {
            throw new RuntimeException("User is not an active member of this group");
        }

        if (!"LEADER".equalsIgnoreCase(membership.get().getRole())) {
            throw new RuntimeException("Only the group leader can start the session");
        }

        GroupSession session = GroupSession.builder()
                .group(group)
                .createdBy(creator)
                .status("OPEN")
                .createdAt(LocalDateTime.now())
                .build();

        return groupSessionRepository.save(session);
    }

    public SessionPreference submitPreference(SubmitPreferenceRequest request) {
        GroupSession session = groupSessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<GroupMember> membership = groupMemberRepository.findByGroupAndUser(session.getGroup(), user);
        if (membership.isEmpty() || !"ACTIVE".equalsIgnoreCase(membership.get().getStatus())) {
            throw new RuntimeException("User is not an active member of this group");
        }

        List<Long> tagIds = request.getTagIds();
        if (tagIds != null && tagIds.size() > 3) {
            throw new RuntimeException("Maximum 3 vibe tags allowed");
        }

        SessionPreference preference = sessionPreferenceRepository.findBySessionAndUser(session, user)
                .orElseGet(() -> SessionPreference.builder()
                        .session(session)
                        .user(user)
                        .createdAt(LocalDateTime.now())
                        .build());

        preference.setCraving(request.getCraving());
        preference.setBudgetRange(request.getBudgetRange());

        SessionPreference savedPreference = sessionPreferenceRepository.save(preference);

        sessionPreferenceTagRepository.deleteBySessionPreference(savedPreference);

        if (tagIds != null) {
            for (Long tagId : tagIds) {
                Tag tag = tagRepository.findById(tagId)
                        .orElseThrow(() -> new RuntimeException("Tag not found: " + tagId));

                SessionPreferenceTag preferenceTag = SessionPreferenceTag.builder()
                        .sessionPreference(savedPreference)
                        .tag(tag)
                        .build();

                sessionPreferenceTagRepository.save(preferenceTag);
            }
        }

        return savedPreference;
    }

    public Vote submitVote(VoteRequest request) {
        GroupSession session = groupSessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Optional<GroupMember> membership = groupMemberRepository.findByGroupAndUser(session.getGroup(), user);
        if (membership.isEmpty() || !"ACTIVE".equalsIgnoreCase(membership.get().getStatus())) {
            throw new RuntimeException("User is not an active member of this group");
        }

        Vote vote = voteRepository.findBySessionAndUser(session, user)
                .orElseGet(() -> Vote.builder()
                        .session(session)
                        .user(user)
                        .createdAt(LocalDateTime.now())
                        .build());

        vote.setRestaurant(restaurant);
        vote.setIsLiked(Boolean.TRUE.equals(request.getIsLiked()));

        return voteRepository.save(vote);
    }

    public Map<String, Object> getSessionResults(Long sessionId) {
        GroupSession session = groupSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<Vote> votes = voteRepository.findBySession(session);

        Map<Long, Integer> likeCounts = new HashMap<>();
        for (Vote vote : votes) {
            if (Boolean.TRUE.equals(vote.getIsLiked())) {
                Long restaurantId = vote.getRestaurant().getId();
                likeCounts.put(restaurantId, likeCounts.getOrDefault(restaurantId, 0) + 1);
            }
        }

        Long winnerRestaurantId = null;
        int maxLikes = 0;

        for (Map.Entry<Long, Integer> entry : likeCounts.entrySet()) {
            if (entry.getValue() > maxLikes) {
                maxLikes = entry.getValue();
                winnerRestaurantId = entry.getKey();
            }
        }

        if (winnerRestaurantId != null) {
            Restaurant winner = restaurantRepository.findById(winnerRestaurantId)
                    .orElseThrow(() -> new RuntimeException("Winning restaurant not found"));

            session.setWinningRestaurant(winner);
            session.setStatus("CLOSED");
            session.setClosedAt(LocalDateTime.now());
            groupSessionRepository.save(session);
        }

        // Map<String, Object> response = new HashMap<>();
        // response.put("sessionId", session.getId());
        // response.put("groupId", session.getGroup().getId());
        // response.put("status", session.getStatus());
        // response.put("totalVotes", votes.size());
        // response.put("likeCounts", likeCounts);
        // response.put("winningRestaurantId", winnerRestaurantId);

        // return response;

            Map<String, Object> response = new HashMap<>();
            response.put("sessionId", session.getId());
            response.put("groupId", session.getGroup().getId());
            response.put("status", session.getStatus());
            response.put("totalVotes", votes.size());
            response.put("likeCounts", likeCounts);
            response.put("winningRestaurantId", winnerRestaurantId);

            if (session.getWinningRestaurant() != null) {
                response.put("winningRestaurantName", session.getWinningRestaurant().getName());
            } else {
                response.put("winningRestaurantName", null);
            }

            return response;

    }








    public List<UserSearchResponse> searchUsersForInvite(Long groupId, String username, Long currentUserId) {
    Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));

    User currentUser = userRepository.findById(currentUserId)
            .orElseThrow(() -> new RuntimeException("Current user not found"));

    Optional<GroupMember> membership = groupMemberRepository.findByGroupAndUser(group, currentUser);
    if (membership.isEmpty() || !"ACTIVE".equalsIgnoreCase(membership.get().getStatus())) {
        throw new RuntimeException("Current user is not an active member of this group");
    }

    List<User> users = userRepository.findByUsernameContainingIgnoreCase(username == null ? "" : username.trim());

    List<GroupMember> currentMembers = groupMemberRepository.findByGroup(group);
    Set<Long> existingMemberIds = currentMembers.stream()
            .map(m -> m.getUser().getUserId())
            .collect(Collectors.toSet());

    return users.stream()
            .filter(user -> !user.getUserId().equals(currentUserId))
            .filter(user -> !existingMemberIds.contains(user.getUserId()))
            .map(user -> new UserSearchResponse(
                    user.getUserId(),
                    user.getUsername(),
                    user.getFirstName(),
                    user.getLastName()
            ))
            .collect(Collectors.toList());
    }








    private String mapBudgetForTopsis(String budgetRange) {
        if (budgetRange == null) return "";
        return switch (budgetRange) {
            case "ZERO_TO_1000" -> "0-1000";
            case "ONE_TO_2000" -> "1000-2000";
            case "TWO_TO_5000" -> "2000-5000";
            case "FIVE_THOUSAND_PLUS" -> "5000+";
            default -> budgetRange;
        };
    }






    public TopsisResponseDto generateTopsisRecommendations(Long sessionId) {
        GroupSession session = groupSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        List<SessionPreference> preferences = sessionPreferenceRepository.findBySession(session);
        if (preferences.isEmpty()) {
            throw new RuntimeException("No session preferences found");
        }

        List<TopsisPreferenceDto> topsisPreferences = new ArrayList<>();

        for (SessionPreference preference : preferences) {
            List<SessionPreferenceTag> preferenceTags =
                    sessionPreferenceTagRepository.findBySessionPreference(preference);

            List<Long> tagIds = preferenceTags.stream()
                    .map(pt -> pt.getTag().getId())
                    .collect(Collectors.toList());

            TopsisPreferenceDto dto = new TopsisPreferenceDto(
                    preference.getUser().getUserId(),
                    preference.getCraving(),
                    mapBudgetForTopsis(preference.getBudgetRange()),
                    tagIds
            );

            topsisPreferences.add(dto);
        }

        List<Restaurant> restaurants = restaurantRepository.findByIsApprovedTrueAndIsActiveTrue();
        if (restaurants.isEmpty()) {
            throw new RuntimeException("No approved active restaurants found");
        }

        List<TopsisRestaurantDto> topsisRestaurants = new ArrayList<>();

        for (Restaurant restaurant : restaurants) {
            List<Long> tagIds = restaurant.getTags() == null
                    ? new ArrayList<>()
                    : restaurant.getTags().stream()
                        .map(Tag::getId)
                        .collect(Collectors.toList());

            List<String> specialties = restaurant.getSpecialities() == null
                    ? new ArrayList<>()
                    : restaurant.getSpecialities().stream()
                        .map(s -> s.getName())
                        .collect(Collectors.toList());

            TopsisRestaurantDto dto = new TopsisRestaurantDto(
                    restaurant.getId(),
                    restaurant.getName(),
                    mapBudgetForTopsis(restaurant.getBudgetRange().name()),
                    tagIds,
                    specialties
            );

            topsisRestaurants.add(dto);
        }

        // Map<String, Double> weights = new HashMap<>();
        // weights.put("craving_match", 0.4);
        // weights.put("budget_match", 0.3);
        // weights.put("tag_match", 0.3);

        // Map<String, String> criteriaTypes = new HashMap<>();
        // criteriaTypes.put("craving_match", "benefit");
        // criteriaTypes.put("budget_match", "benefit");
        // criteriaTypes.put("tag_match", "benefit");

        // TopsisRequestDto requestDto = new TopsisRequestDto(
        //         sessionId,
        //         topsisPreferences,
        //         topsisRestaurants,
        //         weights,
        //         criteriaTypes
        // );

        TopsisRequestDto requestDto = new TopsisRequestDto(
            sessionId,
            topsisPreferences,
            topsisRestaurants,
            null,
            null
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<TopsisRequestDto> requestEntity = new HttpEntity<>(requestDto, headers);

        RestTemplate restTemplate = new RestTemplate();

        String flaskUrl = "http://127.0.0.1:5000/api/topsis/calculate";

        TopsisResponseDto response = restTemplate.postForObject(
                flaskUrl,
                requestEntity,
                TopsisResponseDto.class
        );

        if (response == null) {
            throw new RuntimeException("TOPSIS service returned no response");
        }

        return response;
    }
}