package com.scholarhub.api.service;

import com.scholarhub.api.dto.AdminOverviewResponse;
import com.scholarhub.api.dto.StudentDashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {
  private final UserService userService;
  private final ScholarshipService scholarshipService;
  private final ApplicationService applicationService;
  private final DocumentService documentService;
  private final ActivityService activityService;

  public StudentDashboardResponse getStudentDashboard(String userId) {
    long totalScholarships = scholarshipService.countOpenScholarships();
    long totalDocuments = documentService.countByUserId(userId);

    return new StudentDashboardResponse(
        applicationService.getStudentSummary(userId, totalScholarships, totalDocuments),
        userService.getProfile(userId),
        scholarshipService.listFeaturedScholarships(),
        activityService.findRecentByUserId(userId));
  }

  public AdminOverviewResponse getAdminOverview() {
    return new AdminOverviewResponse(
        userService.countStudents(),
        scholarshipService.listAllScholarships().size(),
        applicationService.countAllApplications(),
        documentService.countPendingDocuments(),
        applicationService.countPendingReviews());
  }
}
