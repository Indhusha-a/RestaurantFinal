package com.restaurant.demo.Service;

import com.restaurant.demo.Entity.Notification;
import com.restaurant.demo.Repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createUserNotification(Long userId, String message, String type) {
        return createNotification(userId, Notification.RecipientType.USER, message, type);
    }

    public Notification createRestaurantNotification(Long restaurantId, String message, String type) {
        return createNotification(restaurantId, Notification.RecipientType.RESTAURANT, message, type);
    }

    public Notification createNotification(
            Long recipientId,
            Notification.RecipientType recipientType,
            String message,
            String type
    ) {
        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .recipientType(recipientType)
                .message(message)
                .type(type)
                .build();

        return notificationRepository.save(notification);
    }
}
