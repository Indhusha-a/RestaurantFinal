package com.restaurant.demo.Controller;

import com.restaurant.demo.Entity.Tag;
import com.restaurant.demo.Service.TagService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@CrossOrigin
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @PostMapping
    public Tag createTag(@RequestBody Tag tag) {
        return tagService.createTag(tag);
    }

    @GetMapping
    public List<Tag> getAllTags() {
        return tagService.getAllTags();
    }
}