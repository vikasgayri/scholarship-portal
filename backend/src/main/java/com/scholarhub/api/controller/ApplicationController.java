package com.scholarhub.api.controller;

import com.scholarhub.api.dto.ApiResponse;
import com.scholarhub.api.dto.ApplicationRequest;
import com.scholarhub.api.dto.ApplicationResponse;
import com.scholarhub.api.security.UserPrincipal;
import com.scholarhub.api.service.ApiException;
import com.scholarhub.api.service.ApplicationService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {
  private final ApplicationService applicationService;

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ApiResponse<ApplicationResponse> createApplication(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @Valid @RequestPart("application") ApplicationRequest request,
      @RequestPart("idProof") MultipartFile idProof,
      @RequestPart("incomeCertificate") MultipartFile incomeCertificate,
      @RequestPart("marksheet") MultipartFile marksheet) {
    return ApiResponse.success(
        "Application submitted successfully.",
        applicationService.apply(
            userPrincipal.getId(),
            request,
            idProof,
            incomeCertificate,
            marksheet));
  }

  @GetMapping("/user/{userId}")
  public ApiResponse<List<ApplicationResponse>> applicationsByUser(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @PathVariable String userId) {
    if (!userPrincipal.getId().equals(userId) && !userPrincipal.getRole().name().equals("ADMIN")) {
      throw new ApiException(HttpStatus.FORBIDDEN, "You can only view your own applications.");
    }

    return ApiResponse.success(
        "Applications loaded.",
        applicationService.findByStudent(userId));
  }
}
