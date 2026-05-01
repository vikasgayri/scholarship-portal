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
@RequestMapping("/api/public/scholarships")
@RequiredArgsConstructor
public class PublicScholarshipController {
  private final ScholarshipService scholarshipService;

  @GetMapping
  public ApiResponse<List<ScholarshipResponse>> listPublicScholarships(
      @RequestParam(defaultValue = "") String query) {
    return ApiResponse.success(
        "Scholarships loaded.",
        scholarshipService.listPublicScholarships(query));
  }
}
