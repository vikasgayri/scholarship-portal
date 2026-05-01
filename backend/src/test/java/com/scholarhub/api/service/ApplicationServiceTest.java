package com.scholarhub.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.scholarhub.api.domain.ApplicationStatus;
import com.scholarhub.api.domain.Role;
import com.scholarhub.api.domain.Scholarship;
import com.scholarhub.api.domain.ScholarshipApplication;
import com.scholarhub.api.domain.ScholarshipStatus;
import com.scholarhub.api.domain.User;
import com.scholarhub.api.dto.ApplicationRequest;
import com.scholarhub.api.dto.ApplicationResponse;
import com.scholarhub.api.repository.ScholarshipApplicationRepository;
import com.scholarhub.api.repository.StudentDocumentRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {
  @Mock
  private ScholarshipApplicationRepository applicationRepository;

  @Mock
  private ScholarshipService scholarshipService;

  @Mock
  private UserService userService;

  @Mock
  private ActivityService activityService;

  @Mock
  private NotificationService notificationService;

  @Mock
  private DocumentService documentService;

  @Mock
  private StudentDocumentRepository studentDocumentRepository;

  @InjectMocks
  private ApplicationService applicationService;

  @Test
  void applyRejectsMissingRequiredApplicationDocuments() {
    User user = User.builder()
        .id("user-1")
        .name("Vikas")
        .email("vikas@example.com")
        .role(Role.USER)
        .course("B.Tech")
        .phoneNumber("9999999999")
        .city("Delhi")
        .state("Delhi")
        .profileComplete(true)
        .build();

    assertThatThrownBy(() -> applicationService.apply(
        "user-1",
        applicationRequest(),
        file("id.pdf"),
        null,
        file("marksheet.pdf")))
        .isInstanceOf(ApiException.class)
        .hasMessageContaining("Income certificate is required");
  }

  @Test
  void applyCreatesSubmittedApplication() {
    User user = User.builder()
        .id("user-1")
        .name("Vikas")
        .email("vikas@example.com")
        .role(Role.USER)
        .course("B.Tech")
        .phoneNumber("9999999999")
        .city("Delhi")
        .state("Delhi")
        .profileComplete(true)
        .build();
    Scholarship scholarship = Scholarship.builder()
        .id("scholarship-1")
        .title("Merit Future Scholarship")
        .provider("National Education Trust")
        .amount(new BigDecimal("50000"))
        .status(ScholarshipStatus.OPEN)
        .deadline(LocalDate.now().plusDays(10))
        .build();

    when(userService.findById("user-1")).thenReturn(user);
    when(userService.isProfileComplete(user)).thenReturn(true);
    when(scholarshipService.findById("scholarship-1")).thenReturn(scholarship);
    when(applicationRepository.existsByScholarshipIdAndStudentId("scholarship-1", "user-1"))
        .thenReturn(false);
    when(applicationRepository.save(any(ScholarshipApplication.class))).thenAnswer(invocation -> {
      ScholarshipApplication application = invocation.getArgument(0);
      application.setId("application-1");
      application.setSubmittedAt(Instant.now());
      application.setUpdatedAt(Instant.now());
      return application;
    });

    ApplicationResponse response = applicationService.apply(
        "user-1",
        applicationRequest(),
        file("id.pdf"),
        file("income.pdf"),
        file("marksheet.pdf"));

    verify(activityService).log("user-1", "Application submitted for Merit Future Scholarship.");
    verify(documentService).uploadForApplication(
        eq("user-1"),
        eq("application-1"),
        eq("Aadhaar / ID proof"),
        any(MultipartFile.class));
    verify(notificationService).sendApplicationSubmitted(any(User.class), any(ScholarshipApplication.class));
    assertThat(response.status()).isEqualTo(ApplicationStatus.SUBMITTED);
    assertThat(response.scholarshipTitle()).isEqualTo("Merit Future Scholarship");
  }

  private ApplicationRequest applicationRequest() {
    return new ApplicationRequest(
        "scholarship-1",
        "Vikas",
        "9999999999",
        "2000-01-01",
        "B.Tech",
        "Engineering College",
        "3rd Year",
        "82",
        new BigDecimal("240000"),
        "General",
        "General",
        "123 Main Road",
        "Delhi",
        "Delhi",
        "110001",
        "A".repeat(90));
  }

  private MultipartFile file(String name) {
    return new MockMultipartFile(name, name, "application/pdf", "file".getBytes());
  }
}
