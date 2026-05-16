package com.scholarhub.api.service;

import com.scholarhub.api.domain.ScholarshipApplication;
import com.scholarhub.api.domain.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {
  private final BrevoEmailService emailService;
  private final long otpExpirationMinutes;

  public NotificationService(
      BrevoEmailService emailService,
      @Value("${app.verification.otp-expiration-minutes}") long otpExpirationMinutes) {
    this.emailService = emailService;
    this.otpExpirationMinutes = otpExpirationMinutes;
  }

  @Async("emailTaskExecutor")
  public void sendRegistrationSuccess(User user) {
    boolean delivered = emailService.sendRegistrationEmail(user.getEmail());
    logDeliveryResult(delivered, user.getEmail(), "registration welcome");
  }

  @Async("emailTaskExecutor")
  public void sendEmailVerificationOtp(User user, String otp) {
    boolean delivered = emailService.sendOtpEmail(user.getEmail(), otp, otpExpirationMinutes);
    logDeliveryResult(delivered, user.getEmail(), "email verification OTP");
  }

  @Async("emailTaskExecutor")
  public void sendApplicationSubmitted(User user, ScholarshipApplication application) {
    boolean delivered = emailService.sendEmail(
        user.getEmail(),
        "Scholarship application submitted",
        "Your application for " + application.getScholarshipTitle() + " was submitted successfully.");
    logDeliveryResult(delivered, user.getEmail(), "application submitted");
  }

  @Async("emailTaskExecutor")
  public void sendApplicationStatusUpdated(User user, ScholarshipApplication application) {
    String statusLabel = application.getStatus().name().replace('_', ' ').toLowerCase();
    String note = application.getReviewerNote() == null || application.getReviewerNote().isBlank()
        ? ""
        : "\n\nReviewer note: " + application.getReviewerNote();

    boolean delivered = emailService.sendEmail(
        user.getEmail(),
        "Scholarship application update",
        "Your application for "
            + application.getScholarshipTitle()
            + " is now "
            + statusLabel
            + "."
            + note);
    logDeliveryResult(delivered, user.getEmail(), "application status update");
  }

  private void logDeliveryResult(boolean delivered, String to, String emailType) {
    if (delivered) {
      log.info("Async {} email completed. To={}", emailType, to);
      return;
    }

    log.error("Async {} email did not deliver. To={}", emailType, to);
  }
}
