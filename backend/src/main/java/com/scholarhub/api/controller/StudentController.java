package com.scholarhub.api.controller;

import java.util.List;
import java.util.Objects;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.scholarhub.api.dto.ActivityResponse;
import com.scholarhub.api.dto.ApiResponse;
import com.scholarhub.api.dto.ApplicationRequest;
import com.scholarhub.api.dto.ApplicationResponse;
import com.scholarhub.api.dto.DocumentResponse;
import com.scholarhub.api.dto.ProfileUpdateRequest;
import com.scholarhub.api.dto.StudentDashboardResponse;
import com.scholarhub.api.dto.UserProfileResponse;
import com.scholarhub.api.security.UserPrincipal;
import com.scholarhub.api.service.ActivityService;
import com.scholarhub.api.service.ApplicationService;
import com.scholarhub.api.service.DashboardService;
import com.scholarhub.api.service.DocumentService;
import com.scholarhub.api.service.DocumentService.DocumentFile;
import com.scholarhub.api.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {
  private final DashboardService dashboardService;
  private final ApplicationService applicationService;
  private final DocumentService documentService;
  private final UserService userService;
  private final ActivityService activityService;

  @GetMapping("/dashboard")
  public ApiResponse<StudentDashboardResponse> dashboard(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ApiResponse.success(
        "Student dashboard loaded.",
        dashboardService.getStudentDashboard(userPrincipal.getId()));
  }

  @GetMapping("/applications")
  public ApiResponse<List<ApplicationResponse>> applications(
      @AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ApiResponse.success(
        "Applications loaded.",
        applicationService.findByStudent(userPrincipal.getId()));
  }

  @PostMapping(value = "/applications", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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

  @GetMapping("/documents")
  public ApiResponse<List<DocumentResponse>> documents(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ApiResponse.success(
        "Documents loaded.",
        documentService.findByUserId(userPrincipal.getId()));
  }

  @PostMapping("/documents")
  public ApiResponse<DocumentResponse> uploadDocument(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @RequestParam(required = false) String category,
      @RequestPart("file") MultipartFile file) {
    return ApiResponse.success(
        "Document uploaded successfully.",
        documentService.upload(userPrincipal.getId(), category, file));
  }

  @GetMapping("/documents/{documentId}/view")
  public ResponseEntity<Resource> viewDocument(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @PathVariable String documentId) {
    DocumentFile documentFile = documentService.loadForUser(userPrincipal.getId(), documentId);
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(Objects.requireNonNull(documentFile.contentType(), "Content type is required")))
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + documentFile.fileName() + "\"")
        .body(documentFile.resource());
  }

  @GetMapping("/documents/{documentId}/download")
  public ResponseEntity<Resource> downloadDocument(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @PathVariable String documentId) {
    DocumentFile documentFile = documentService.loadForUser(userPrincipal.getId(), documentId);
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(Objects.requireNonNull(documentFile.contentType(), "Content type is required")))
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + documentFile.fileName() + "\"")
        .body(documentFile.resource());
  }

  @DeleteMapping("/documents/{documentId}")
  public ApiResponse<Void> deleteDocument(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @PathVariable String documentId) {
    documentService.deleteForUser(userPrincipal.getId(), documentId);
    return ApiResponse.success("Document deleted successfully.", null);
  }

  @GetMapping("/profile")
  public ApiResponse<UserProfileResponse> profile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ApiResponse.success("Profile loaded.", userService.getProfile(userPrincipal.getId()));
  }

  @PutMapping("/profile")
  public ApiResponse<UserProfileResponse> updateProfile(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @Valid @RequestBody ProfileUpdateRequest request) {
    return ApiResponse.success(
        "Profile updated successfully.",
        userService.updateProfile(userPrincipal.getId(), request));
  }

  @DeleteMapping("/account")
  public ApiResponse<Void> deleteAccount(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    documentService.deleteAllByUserId(userPrincipal.getId());
    applicationService.deleteAllByStudentId(userPrincipal.getId());
    activityService.deleteAllByUserId(userPrincipal.getId());
    userService.deleteOwnAccount(userPrincipal.getId());
    return ApiResponse.success("Your account has been deleted successfully.", null);
  }

  @GetMapping("/activities")
  public ApiResponse<List<ActivityResponse>> activities(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ApiResponse.success(
        "Activities loaded.",
        activityService.findRecentByUserId(userPrincipal.getId()));
  }
}
