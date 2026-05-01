package com.scholarhub.api.controller;

import java.util.List;
import java.util.Objects;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.scholarhub.api.domain.DocumentStatus;
import com.scholarhub.api.dto.AdminApplicationResponse;
import com.scholarhub.api.dto.AdminOverviewResponse;
import com.scholarhub.api.dto.AdminUserResponse;
import com.scholarhub.api.dto.ApiResponse;
import com.scholarhub.api.dto.ApplicationResponse;
import com.scholarhub.api.dto.ApplicationStatusRequest;
import com.scholarhub.api.dto.DocumentResponse;
import com.scholarhub.api.dto.ScholarshipRequest;
import com.scholarhub.api.dto.ScholarshipResponse;
import com.scholarhub.api.service.ApplicationService;
import com.scholarhub.api.service.ActivityService;
import com.scholarhub.api.service.DashboardService;
import com.scholarhub.api.service.DocumentService;
import com.scholarhub.api.service.DocumentService.DocumentFile;
import com.scholarhub.api.service.ScholarshipService;
import com.scholarhub.api.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
  private final DashboardService dashboardService;
  private final ApplicationService applicationService;
  private final ActivityService activityService;
  private final DocumentService documentService;
  private final ScholarshipService scholarshipService;
  private final UserService userService;

  @GetMapping("/overview")
  public ApiResponse<AdminOverviewResponse> overview() {
    return ApiResponse.success("Admin overview loaded.", dashboardService.getAdminOverview());
  }

  @GetMapping("/users")
  public ApiResponse<List<AdminUserResponse>> users() {
    return ApiResponse.success("Users loaded.", userService.findAllUsers());
  }

  @DeleteMapping("/users/{userId}")
  public ApiResponse<Void> deleteUser(@PathVariable String userId) {
    userService.findDeletableUser(userId);
    documentService.deleteAllByUserId(userId);
    applicationService.deleteAllByStudentId(userId);
    activityService.deleteAllByUserId(userId);
    userService.deleteUser(userId);
    return ApiResponse.success("User deleted successfully.", null);
  }

  @GetMapping("/applications")
  public ApiResponse<List<AdminApplicationResponse>> applications() {
    return ApiResponse.success("Applications loaded.", applicationService.findAllForAdmin());
  }

  @PatchMapping("/applications/{applicationId}/status")
  public ApiResponse<ApplicationResponse> updateApplicationStatus(
      @PathVariable String applicationId,
      @Valid @RequestBody ApplicationStatusRequest request) {
    return ApiResponse.success(
        "Application status updated.",
        applicationService.updateStatus(applicationId, request));
  }

  @PutMapping("/application/{applicationId}/status")
  public ApiResponse<ApplicationResponse> updateApplicationStatusAlias(
      @PathVariable String applicationId,
      @Valid @RequestBody ApplicationStatusRequest request) {
    return updateApplicationStatus(applicationId, request);
  }

  @GetMapping("/documents")
  public ApiResponse<List<DocumentResponse>> documents() {
    return ApiResponse.success("Documents loaded.", documentService.findAll());
  }

  @GetMapping("/documents/{documentId}/view")
  public ResponseEntity<Resource> viewDocument(@PathVariable @NonNull String documentId) {
    DocumentFile documentFile = documentService.loadForAdmin(documentId);
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(Objects.requireNonNull(documentFile.contentType(), "Content type is required")))
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + documentFile.fileName() + "\"")
        .body(documentFile.resource());
  }

  @GetMapping("/documents/{documentId}/download")
  public ResponseEntity<Resource> downloadDocument(@PathVariable @NonNull String documentId) {
    DocumentFile documentFile = documentService.loadForAdmin(documentId);
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(Objects.requireNonNull(documentFile.contentType(), "Content type is required")))
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + documentFile.fileName() + "\"")
        .body(documentFile.resource());
  }

  @PatchMapping("/documents/{documentId}/status")
  public ApiResponse<DocumentResponse> updateDocumentStatus(
      @PathVariable String documentId,
      @RequestParam DocumentStatus status) {
    return ApiResponse.success(
        "Document status updated.",
        documentService.updateStatus(documentId, status));
  }

  @DeleteMapping("/documents/{documentId}")
  public ApiResponse<Void> deleteDocument(@PathVariable String documentId) {
    documentService.deleteByAdmin(documentId);
    return ApiResponse.success("Document deleted successfully.", null);
  }

  @GetMapping("/scholarships")
  public ApiResponse<List<ScholarshipResponse>> scholarships() {
    return ApiResponse.success("Scholarships loaded.", scholarshipService.listAllScholarships());
  }

  @PostMapping("/scholarships")
  public ApiResponse<ScholarshipResponse> createScholarship(
      @Valid @RequestBody ScholarshipRequest request) {
    return ApiResponse.success(
        "Scholarship created successfully.",
        scholarshipService.createScholarship(request));
  }

  @PutMapping("/scholarships/{scholarshipId}")
  public ApiResponse<ScholarshipResponse> updateScholarship(
      @PathVariable String scholarshipId,
      @Valid @RequestBody ScholarshipRequest request) {
    return ApiResponse.success(
        "Scholarship updated successfully.",
        scholarshipService.updateScholarship(scholarshipId, request));
  }
}
