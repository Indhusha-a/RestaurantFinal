package com.restaurant.demo.Controller;

import com.restaurant.demo.Service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin(origins = "http://localhost:3000")
public class LeaderboardController {

    @Autowired
    private GroupService groupService;

    @GetMapping
    public ResponseEntity<?> getGroupLeaderboardCompat() {
        return getGroupLeaderboard();
    }

    // Retrieve top 10 groups by points for the weekly leaderboard
    @GetMapping("/groups")
    public ResponseEntity<?> getGroupLeaderboard() {
        try {
            List<Map<String, Object>> leaderboard = groupService.getGroupLeaderboard();
            return ResponseEntity.ok(leaderboard);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("message", "Error fetching leaderboard: " + e.getMessage())
            );
        }
    }

    // Retrieve a specific group's leaderboard position and details
    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getGroupPoints(@PathVariable Long groupId) {
        try {
            Map<String, Object> groupData = groupService.getGroupLeaderboardPosition(groupId);
            return ResponseEntity.ok(groupData);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(
                    Map.of("message", "Group not found or error: " + e.getMessage())
            );
        }
    }
}
