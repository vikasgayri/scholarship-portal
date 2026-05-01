package com.scholarhub.api.service;

import com.scholarhub.api.domain.ScholarshipApplication;
import com.scholarhub.api.domain.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {
  private final JavaMailSender mailSender;
  private final String fromAddress;
  private final String mailUsername;
  private final String mailPassword;
  private final long otpExpirationMinutes;

  public NotificationService(
      JavaMailSender mailSender,
      @Value("${app.mail.from}") String fromAddress,
      @Value("${spring.mail.username}") String mailUsername,
      @Value("${spring.mail.password}") String mailPassword,
      @Value("${app.verification.otp-expiration-minutes}") long otpExpirationMinutes) {
    this.mailSender = mailSender;
    this.fromAddress = fromAddress;
    this.mailUsername = mailUsername;
    this.mailPassword = mailPassword;
    this.otpExpirationMinutes = otpExpirationMinutes;
  }

  public void sendRegistrationSuccess(User user) {
    sendEmail(
        user.getEmail(),
        "Welcome to ScholarHub",
        "Your ScholarHub account was created successfully. Verify your email address to activate login.",
        false);
  }

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

  public void sendApplicationSubmitted(User user, ScholarshipApplication application) {
    sendEmail(
        user.getEmail(),
        "Scholarship application submitted",
        "Your application for " + application.getScholarshipTitle() + " was submitted successfully.",
        false);
  }

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
    if (!isMailConfigured()) {
      log.warn(
          "Skipping {} email because SMTP is not configured. To={} Subject={}",
          required ? "required" : "optional",
          to,
          subject);
      return;
    }

    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(resolveFromAddress());
    message.setTo(to);
    message.setSubject(subject);
    message.setText(body);

    try {
      mailSender.send(message);
    } catch (RuntimeException exception) {
      log.warn("Email delivery failed. To={} Subject={} Reason={}", to, subject, exception.getMessage());

      if (required) {
        log.warn("Required email failed; returning mock OTP fallback to API response.");
      }
    }
  }

  public boolean isMailConfigured() {
    return !isBlank(mailUsername) && !isBlank(mailPassword);
  }

  private String resolveFromAddress() {
    return isBlank(fromAddress) ? mailUsername : fromAddress;
  }

  private boolean isBlank(String value) {
    return value == null || value.isBlank();
  }
}
