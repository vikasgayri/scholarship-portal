package com.scholarhub.api.service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.scholarhub.api.domain.ApplicationStatus;
import com.scholarhub.api.domain.Scholarship;
import com.scholarhub.api.domain.ScholarshipApplication;
import com.scholarhub.api.domain.ScholarshipStatus;
import com.scholarhub.api.domain.StudentDocument;
import com.scholarhub.api.domain.User;
import com.scholarhub.api.dto.AdminApplicationDocumentResponse;
import com.scholarhub.api.dto.AdminApplicationResponse;
import com.scholarhub.api.dto.AdminApplicationUserResponse;
import com.scholarhub.api.dto.ApiMappers;
import com.scholarhub.api.dto.ApplicationRequest;
import com.scholarhub.api.dto.ApplicationResponse;
import com.scholarhub.api.dto.ApplicationStatusRequest;
import com.scholarhub.api.dto.DashboardSummaryResponse;
import com.scholarhub.api.repository.ScholarshipApplicationRepository;
import com.scholarhub.api.repository.StudentDocumentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationService {
  private final ScholarshipApplicationRepository applicationRepository;
  private final ScholarshipService scholarshipService;
  private final UserService userService;
  private final ActivityService activityService;
  private final NotificationService notificationService;
  private final DocumentService documentService;
  private final StudentDocumentRepository studentDocumentRepository;

  public ApplicationResponse apply(
      @NonNull String userId,
      ApplicationRequest request,
      MultipartFile idProof,
      MultipartFile incomeCertificate,
      MultipartFile marksheet) {
    User user = userService.findById(userId);
    validateRequiredApplicationDocument(idProof, "Aadhaar / ID proof");
    validateRequiredApplicationDocument(incomeCertificate, "Income certificate");
    validateRequiredApplicationDocument(marksheet, "Marksheet");

    if (!userService.isProfileComplete(user)) {
      throw new ApiException("Complete your profile before submitting an application.");
    }

    Scholarship scholarship = scholarshipService.findById(request.scholarshipId());

    if (scholarship.getStatus() != ScholarshipStatus.OPEN
        || scholarship.getDeadline().isBefore(LocalDate.now())) {
      throw new ApiException("This scholarship is no longer accepting applications.");
    }

    if (applicationRepository.existsByScholarshipIdAndStudentId(scholarship.getId(), userId)) {
      throw new ApiException("You have already applied for this scholarship.");
    }

    ScholarshipApplication application = applicationRepository.save(
        ScholarshipApplication.builder()
            .scholarshipId(scholarship.getId())
            .scholarshipTitle(scholarship.getTitle())
            .provider(scholarship.getProvider())
            .amount(scholarship.getAmount())
            .studentId(user.getId())
            .studentName(request.fullName().trim())
            .studentEmail(user.getEmail())
            .phoneNumber(request.phoneNumber().trim())
            .dateOfBirth(request.dateOfBirth().trim())
            .course(request.course().trim())
            .institution(request.institution().trim())
            .academicYear(request.academicYear().trim())
            .percentage(request.percentage().trim())
            .annualIncome(request.annualIncome())
            .category(request.category().trim())
            .caste(request.caste().trim())
            .addressLine(request.addressLine().trim())
            .city(request.city().trim())
            .state(request.state().trim())
            .pincode(request.pincode().trim())
            .essay(request.essay().trim())
            .status(ApplicationStatus.SUBMITTED)
            .submittedAt(Instant.now())
            .updatedAt(Instant.now())
            .build());

    activityService.log(userId, "Application submitted for " + scholarship.getTitle() + ".");
    documentService.uploadForApplication(userId, application.getId(), "Aadhaar / ID proof", idProof);
    documentService.uploadForApplication(userId, application.getId(), "Income certificate", incomeCertificate);
    documentService.uploadForApplication(userId, application.getId(), "Marksheet", marksheet);
    notificationService.sendApplicationSubmitted(user, application);
    return ApiMappers.toApplicationResponse(application);
  }

  private void validateRequiredApplicationDocument(MultipartFile file, String label) {
    if (file == null || file.isEmpty()) {
      throw new ApiException(label + " is required.");
    }
  }

  public List<ApplicationResponse> findByStudent(String userId) {
    return applicationRepository.findAllByStudentIdOrderByUpdatedAtDesc(userId).stream()
        .map(ApiMappers::toApplicationResponse)
        .toList();
  }

  public List<ApplicationResponse> findAll() {
    return applicationRepository.findAll().stream()
        .sorted(Comparator.comparing(ScholarshipApplication::getUpdatedAt).reversed())
        .map(ApiMappers::toApplicationResponse)
        .toList();
  }

  public List<AdminApplicationResponse> findAllForAdmin() {
    return applicationRepository.findAll().stream()
        .sorted(Comparator.comparing(ScholarshipApplication::getUpdatedAt).reversed())
        .map(this::toAdminApplicationResponse)
        .toList();
  }

  public ApplicationResponse updateStatus(@NonNull String applicationId, ApplicationStatusRequest request) {
    ScholarshipApplication application = applicationRepository.findById(applicationId)
        .orElseThrow(() -> new ApiException("Application was not found."));

    application.setStatus(request.status());
    application.setReviewerNote(request.reviewerNote() == null ? "" : request.reviewerNote().trim());
    application.setUpdatedAt(Instant.now());

    ScholarshipApplication updatedApplication = applicationRepository.save(application);
    activityService.log(
        application.getStudentId(),
        application.getScholarshipTitle() + " moved to " + request.status().name().replace('_', ' ').toLowerCase() + ".");
    notificationService.sendApplicationStatusUpdated(
        userService.findById(application.getStudentId()),
        updatedApplication);

    return ApiMappers.toApplicationResponse(updatedApplication);
  }

  public void deleteAllByStudentId(String userId) {
    applicationRepository.deleteAllByStudentId(userId);
  }

  public DashboardSummaryResponse getStudentSummary(String userId, long totalScholarships, long documents) {
    List<ScholarshipApplication> applications =
        applicationRepository.findAllByStudentIdOrderByUpdatedAtDesc(userId);

    long approved = applications.stream()
        .filter(application -> application.getStatus() == ApplicationStatus.APPROVED)
        .count();
    long underReview = applications.stream()
        .filter(application -> application.getStatus() == ApplicationStatus.UNDER_REVIEW)
        .count();

    return new DashboardSummaryResponse(
        totalScholarships,
        applications.size(),
        underReview,
        approved,
        documents);
  }

  public long countAllApplications() {
    return applicationRepository.count();
  }

  public long countPendingReviews() {
    return applicationRepository.findAll().stream()
        .filter(application -> application.getStatus() == ApplicationStatus.SUBMITTED
            || application.getStatus() == ApplicationStatus.UNDER_REVIEW
            || application.getStatus() == ApplicationStatus.NEEDS_CHANGES)
        .count();
  }

  private AdminApplicationResponse toAdminApplicationResponse(ScholarshipApplication application) {
    List<AdminApplicationDocumentResponse> documents =
        studentDocumentRepository.findAllByApplicationIdOrderByUploadedAtDesc(application.getId()).stream()
            .map(document -> toAdminApplicationDocumentResponse(document, application.getStudentName()))
            .toList();

    return new AdminApplicationResponse(
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
        application.getUpdatedAt(),
        new AdminApplicationUserResponse(
            application.getStudentId(),
            application.getStudentName(),
            application.getStudentEmail(),
            application.getPhoneNumber()),
        documents);
  }

  private AdminApplicationDocumentResponse toAdminApplicationDocumentResponse(
      StudentDocument document,
      String uploadedBy) {
    return new AdminApplicationDocumentResponse(
        document.getId(),
        document.getName(),
        document.getCategory(),
        "/api/admin/documents/" + document.getId() + "/view",
        document.getStoredFileName(),
        document.getCategory(),
        document.getContentType(),
        document.getStatus(),
        document.getUploadedAt(),
        uploadedBy);
  }
}
