package com.scholarhub.api.service;

import com.scholarhub.api.domain.ScholarshipApplication;
import com.scholarhub.api.domain.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@Slf4j
public class NotificationService {
  private final RestClient resendClient;
  private final String resendApiKey;
  private final String fromAddress;
  private final long otpExpirationMinutes;

  public NotificationService(
      RestClient.Builder restClientBuilder,
      @Value("${app.resend.base-url}") String resendBaseUrl,
      @Value("${app.resend.api-key}") String resendApiKey,
      @Value("${app.mail.from}") String fromAddress,
      @Value("${app.verification.otp-expiration-minutes}") long otpExpirationMinutes) {
    this.resendClient = restClientBuilder.baseUrl(resendBaseUrl).build();
    this.resendApiKey = resendApiKey;
    this.fromAddress = fromAddress;
    this.otpExpirationMinutes = otpExpirationMinutes;
  }

  @Async
  public void sendRegistrationSuccess(User user) {
    sendEmail(
        user.getEmail(),
        "Welcome to ScholarHub",
        "Your ScholarHub account was created successfully. Verify your email address to activate login.",
        false);
  }

  @Async
  public void sendEmailVerificationOtp(User user, String otp) {
    sendEmail(
        user.getEmail(),
        "Verify your ScholarHub email",
        "Use this OTP to verify your email address: "
            + otp
            + ". It expires in "
            + otpExpirationMinutes
            + " minutes.",
        true);
  }

  @Async
  public void sendLoginSuccess(User user) {
    sendEmail(
        user.getEmail(),
        "New ScholarHub login",
        "Your ScholarHub account was signed in successfully.",
        false);
  }

  @Async
  public void sendApplicationSubmitted(User user, ScholarshipApplication application) {
    sendEmail(
        user.getEmail(),
        "Scholarship application submitted",
        "Your application for " + application.getScholarshipTitle() + " was submitted successfully.",
        false);
  }

  @Async
  public void sendApplicationStatusUpdated(User user, ScholarshipApplication application) {
    String statusLabel = application.getStatus().name().replace('_', ' ').toLowerCase();
    String note = application.getReviewerNote() == null || application.getReviewerNote().isBlank()
        ? ""
        : "\n\nReviewer note: " + application.getReviewerNote();

    sendEmail(
        user.getEmail(),
        "Scholarship application update",
        "Your application for "
            + application.getScholarshipTitle()
            + " is now "
            + statusLabel
            + "."
            + note,
        false);
  }

  private void sendEmail(String to, String subject, String body, boolean required) {
    if (!isResendConfigured()) {
      log.error(
          "Skipping {} email because Resend is not configured. Set RESEND_API_KEY and APP_MAIL_FROM. To={} Subject={}",
          required ? "required" : "optional",
          to,
          subject);
      return;
    }

    try {
      ResendEmailResponse response = resendClient.post()
          .uri("/emails")
          .header(HttpHeaders.AUTHORIZATION, "Bearer " + resendApiKey)
          .contentType(MediaType.APPLICATION_JSON)
          .body(new ResendEmailRequest(fromAddress, to, subject, body))
          .retrieve()
          .body(ResendEmailResponse.class);

      log.info("Email delivered through Resend. To={} Subject={} MessageId={}", to, subject, response == null ? null : response.id());
    } catch (RuntimeException exception) {
      log.error("Email delivery failed through Resend. To={} Subject={} Reason={}", to, subject, exception.getMessage(), exception);
    }
  }

  public boolean isResendConfigured() {
    return !isBlank(resendApiKey) && !isBlank(fromAddress);
  }

  private boolean isBlank(String value) {
    return value == null || value.isBlank();
  }

  private record ResendEmailRequest(String from, String to, String subject, String text) {
  }

  private record ResendEmailResponse(String id) {
  }
}
