package com.restaurant.demo.Repository;

import com.restaurant.demo.Entity.Notification;
import com.restaurant.demo.Entity.Notification.RecipientType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdAndRecipientTypeOrderByCreatedAtDesc(Long recipientId, RecipientType recipientType);

    long countByRecipientIdAndRecipientTypeAndIsReadFalse(Long recipientId, RecipientType recipientType);
}
