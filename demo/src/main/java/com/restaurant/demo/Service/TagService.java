package com.restaurant.demo.Service;

import com.restaurant.demo.Entity.Tag;
import com.restaurant.demo.Repository.TagRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;

    private static final List<String> DEFAULT_TAGS = List.of(
            "Cozy Cafe", "Family Friendly", "Romantic", "Fine Dining", "Street Food",
            "Casual", "Trendy", "Quiet", "Lively", "Outdoor"
    );

    @PostConstruct
    public void seedDefaults() {
        DEFAULT_TAGS.forEach(this::createIfMissing);
    }

    public Tag createTag(Tag tag) {
        return tagRepository.save(tag);
    }

    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    public Tag getOrCreate(String name) {
        return tagRepository.findByTagNameIgnoreCase(name)
                .orElseGet(() -> createTag(Tag.builder()
                        .tagName(name)
                        .tagDescription("Restaurant vibe")
                        .build()));
    }

    private void createIfMissing(String tagName) {
        tagRepository.findByTagNameIgnoreCase(tagName).orElseGet(() ->
                tagRepository.save(Tag.builder()
                        .tagName(tagName)
                        .tagDescription("Restaurant vibe")
                        .build()));
    }
}
