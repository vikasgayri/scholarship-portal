package com.scholarhub.api.dto;

import com.scholarhub.api.domain.ActivityRecord;
import com.scholarhub.api.domain.Scholarship;
import com.scholarhub.api.domain.ScholarshipApplication;
import com.scholarhub.api.domain.StudentDocument;
import com.scholarhub.api.domain.User;

public final class ApiMappers {
  private ApiMappers() {
  }

  public static UserProfileResponse toUserProfile(User user) {
    return new UserProfileResponse(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole(),
        user.getCourse(),
        user.getPhoneNumber(),
        user.getCity(),
        user.getState(),
        user.isProfileComplete(),
        user.isEmailVerified());
  }

  public static AdminUserResponse toAdminUser(User user) {
    return new AdminUserResponse(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getPhoneNumber(),
        user.getRole(),
        user.getCourse(),
        user.getCity(),
        user.getState(),
        user.isProfileComplete(),
        user.isEmailVerified(),
        user.getCreatedAt());
  }

  public static ScholarshipResponse toScholarshipResponse(Scholarship scholarship) {
    return new ScholarshipResponse(
        scholarship.getId(),
        scholarship.getTitle(),
        scholarship.getProvider(),
        scholarship.getDescription(),
        scholarship.getEligibility(),
        scholarship.getCategory(),
        scholarship.getAmount(),
        scholarship.getSeats(),
        scholarship.getDeadline(),
        scholarship.getStatus(),
        scholarship.isFeatured(),
        scholarship.getLocation());
  }

  public static ApplicationResponse toApplicationResponse(ScholarshipApplication application) {
    return new ApplicationResponse(
        application.getId(),
        application.getScholarshipId(),
        application.getScholarshipTitle(),
        application.getProvider(),
        application.getAmount(),
        application.getStudentId(),
        application.getStudentName(),
        application.getStudentEmail(),
        application.getPhoneNumber(),
        application.getDateOfBirth(),
        application.getCourse(),
        application.getInstitution(),
        application.getAcademicYear(),
        application.getPercentage(),
        application.getAnnualIncome(),
        application.getCategory(),
        application.getCaste(),
        application.getAddressLine(),
        application.getCity(),
        application.getState(),
        application.getPincode(),
        application.getEssay(),
        application.getStatus(),
        application.getReviewerNote(),
        application.getSubmittedAt(),
        application.getUpdatedAt());
  }

  public static DocumentResponse toDocumentResponse(StudentDocument document) {
    return new DocumentResponse(
        document.getId(),
        document.getUserId(),
        document.getApplicationId(),
        document.getName(),
        document.getStoredFileName(),
        document.getFilePath() == null ? "uploads/" + document.getStoredFileName() : document.getFilePath(),
        document.getCategory(),
        document.getContentType(),
        document.getSize(),
        document.getStatus(),
        document.getUploadedAt());
  }

  public static ActivityResponse toActivityResponse(ActivityRecord activityRecord) {
    return new ActivityResponse(
        activityRecord.getId(),
        activityRecord.getMessage(),
        activityRecord.getCreatedAt());
  }
}
