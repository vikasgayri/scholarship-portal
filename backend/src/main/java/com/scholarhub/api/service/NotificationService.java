package com.scholarhub.api.service;

import com.scholarhub.api.domain.ScholarshipApplication;
import com.scholarhub.api.domain.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
  private final EmailService emailService;
  private final long otpExpirationMinutes;

  public NotificationService(
      EmailService emailService,
      @Value("${app.verification.otp-expiration-minutes}") long otpExpirationMinutes) {
    this.emailService = emailService;
    this.otpExpirationMinutes = otpExpirationMinutes;
  }

  public void sendRegistrationSuccess(User user) {
    emailService.sendRegistrationEmail(user.getEmail());
  }

  public void sendEmailVerificationOtp(User user, String otp) {
    emailService.sendOtpEmail(user.getEmail(), otp, otpExpirationMinutes);
  }

  public void sendApplicationSubmitted(User user, ScholarshipApplication application) {
    emailService.sendEmail(
        user.getEmail(),
        "Scholarship application submitted",
        "Your application for " + application.getScholarshipTitle() + " was submitted successfully.");
  }

  public void sendApplicationStatusUpdated(User user, ScholarshipApplication application) {
    String statusLabel = application.getStatus().name().replace('_', ' ').toLowerCase();
    String note = application.getReviewerNote() == null || application.getReviewerNote().isBlank()
        ? ""
        : "\n\nReviewer note: " + application.getReviewerNote();

    emailService.sendEmail(
        user.getEmail(),
        "Scholarship application update",
        "Your application for "
            + application.getScholarshipTitle()
            + " is now "
            + statusLabel
            + "."
            + note);
  }
}
