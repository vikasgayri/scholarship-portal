package com.scholarhub.api.dto;

import java.util.List;

public record StudentDashboardResponse(
    DashboardSummaryResponse summary,
    UserProfileResponse profile,
    List<ScholarshipResponse> featuredScholarships,
    List<ActivityResponse> recentActivities) {
}
