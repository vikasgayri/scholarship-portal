package com.scholarhub.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {
  private final JavaMailSender mailSender;
  private final String fromAddress;
  private final String mailUsername;
  private final String mailPassword;

  public EmailService(
      JavaMailSender mailSender,
      @Value("${app.mail.from}") String fromAddress,
      @Value("${spring.mail.username}") String mailUsername,
      @Value("${spring.mail.password}") String mailPassword) {
    this.mailSender = mailSender;
    this.fromAddress = fromAddress;
    this.mailUsername = mailUsername;
    this.mailPassword = mailPassword;
  }

  public boolean sendRegistrationEmail(String to) {
    return sendEmail(
        to,
        "Welcome to ScholarHub",
        "Your ScholarHub account was created successfully. Verify your email address to activate login.");
  }

  public boolean sendOtpEmail(String to, String otp, long expirationMinutes) {
    return sendEmail(
        to,
        "Verify your ScholarHub email",
        "Use this OTP to verify your email address: "
            + otp
            + ". It expires in "
            + expirationMinutes
            + " minutes.");
  }

  public boolean sendForgotPasswordEmail(String to, String resetCode, long expirationMinutes) {
    return sendEmail(
        to,
        "Reset your ScholarHub password",
        "Use this code to reset your ScholarHub password: "
            + resetCode
            + ". It expires in "
            + expirationMinutes
            + " minutes. If you did not request this, you can ignore this email.");
  }

  public boolean sendEmail(String to, String subject, String body) {
    if (!isConfigured()) {
      log.error(
          "Skipping email because Gmail SMTP is not configured. Set SPRING_MAIL_USERNAME and SPRING_MAIL_PASSWORD. To={} Subject={}",
          to,
          subject);
      return false;
    }

    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(resolveFromAddress());
    message.setTo(to);
    message.setSubject(subject);
    message.setText(body);

    try {
      mailSender.send(message);
      log.info("Email delivered through Gmail SMTP. To={} Subject={}", to, subject);
      return true;
    } catch (MailException exception) {
      log.error("Email delivery failed through Gmail SMTP. To={} Subject={} Reason={}", to, subject, exception.getMessage(), exception);
      return false;
    }
  }

  public boolean isConfigured() {
    return !isBlank(mailUsername) && !isBlank(mailPassword);
  }

  private String resolveFromAddress() {
    return isBlank(fromAddress) ? mailUsername : fromAddress;
  }

  private boolean isBlank(String value) {
    return value == null || value.isBlank();
  }
}
