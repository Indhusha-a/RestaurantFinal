package com.restaurant.demo.Service;

import com.restaurant.demo.Entity.Speciality;
import com.restaurant.demo.Repository.SpecialityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpecialityService {

    private final SpecialityRepository specialityRepository;

    public SpecialityService(SpecialityRepository specialityRepository) {
        this.specialityRepository = specialityRepository;
    }

    public Speciality createSpeciality(Speciality speciality) {
        return specialityRepository.save(speciality);
    }

    public List<Speciality> getAllSpecialities() {
        return specialityRepository.findAll();
    }
}