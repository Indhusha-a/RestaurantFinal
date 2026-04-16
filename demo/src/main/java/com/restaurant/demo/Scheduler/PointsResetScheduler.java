package com.restaurant.demo.Scheduler;

import com.restaurant.demo.Service.GroupService;
import com.restaurant.demo.Service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
@EnableScheduling
public class PointsResetScheduler {

    @Autowired
    private GroupService groupService;

    @Autowired
    private RestaurantService restaurantService;

    // Run every Monday at 00:00:00 to reset group and restaurant weekly points
    @Scheduled(cron = "0 0 0 ? * MON", zone = "UTC")
    public void resetWeeklyPoints() {
        try {
            groupService.resetWeeklyGroupPoints();
            restaurantService.resetWeeklyRestaurantPoints();
            
            LocalDateTime now = LocalDateTime.now();
            DateTimeFormatter dateformat = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            System.out.println("[PointsResetScheduler] Weekly points reset completed at: " + now.format(dateformat));
        } catch (Exception e) {
            System.err.println("[PointsResetScheduler] Error during points reset: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
