package com.scholarhub.api.controller;

import com.scholarhub.api.dto.ApiResponse;
import com.scholarhub.api.dto.ScholarshipResponse;
import com.scholarhub.api.service.ScholarshipService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/scholarships")
@RequiredArgsConstructor
public class ScholarshipController {
  private final ScholarshipService scholarshipService;

  @GetMapping
  public ApiResponse<List<ScholarshipResponse>> listScholarships(
      @RequestParam(defaultValue = "") String query) {
    return ApiResponse.success(
        "Scholarships loaded.",
        scholarshipService.listPublicScholarships(query));
  }
}
