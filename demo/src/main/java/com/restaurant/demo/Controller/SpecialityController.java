package com.restaurant.demo.Controller;

import com.restaurant.demo.Entity.Speciality;
import com.restaurant.demo.Service.SpecialityService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specialities")
@CrossOrigin
public class SpecialityController {

    private final SpecialityService specialityService;

    public SpecialityController(SpecialityService specialityService) {
        this.specialityService = specialityService;
    }

    @PostMapping
    public Speciality createSpeciality(@RequestBody Speciality speciality) {
        return specialityService.createSpeciality(speciality);
    }

    @GetMapping
    public List<Speciality> getAllSpecialities() {
        return specialityService.getAllSpecialities();
    }
}