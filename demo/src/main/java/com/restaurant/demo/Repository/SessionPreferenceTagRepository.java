package com.restaurant.demo.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.demo.Entity.SessionPreference;
import com.restaurant.demo.Entity.SessionPreferenceTag;

public interface SessionPreferenceTagRepository extends JpaRepository<SessionPreferenceTag, Long> {
    List<SessionPreferenceTag> findBySessionPreference(SessionPreference sessionPreference);
    void deleteBySessionPreference(SessionPreference sessionPreference);
}