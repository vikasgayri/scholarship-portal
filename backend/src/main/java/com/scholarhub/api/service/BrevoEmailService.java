package com.scholarhub.api.service;

import java.util.List;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@Slf4j
public class BrevoEmailService {
  private static final String DEFAULT_SENDER_NAME = "ScholarHub";

  private final RestClient brevoClient;
  private final String brevoApiKey;
  private final Sender sender;

  public BrevoEmailService(
      RestClient.Builder restClientBuilder,
      @Value("${app.brevo.base-url}") String brevoBaseUrl,
      @Value("${app.brevo.api-key}") String brevoApiKey,
      @Value("${app.mail.from}") String fromAddress) {
    this.brevoClient = restClientBuilder.baseUrl(brevoBaseUrl).build();
    this.brevoApiKey = brevoApiKey;
    this.sender = parseSender(fromAddress);
  }

  public boolean sendRegistrationEmail(String to) {
    return sendEmail(
        to,
        "Welcome to ScholarHub",
        """
            <p>Your ScholarHub account was created successfully.</p>
            <p>Please verify your email address with the OTP we sent to activate login.</p>
            """,
        "Your ScholarHub account was created successfully. Verify your email address to activate login.");
  }

  public boolean sendOtpEmail(String to, String otp, long expirationMinutes) {
    String safeOtp = escapeHtml(otp);
    String htmlBody = """
        <p>Use this OTP to verify your ScholarHub email address:</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:6px;margin:24px 0;color:#0f766e;">%s</div>
        <p>This code expires in %d minutes.</p>
        <p>If you did not request this code, you can ignore this email.</p>
        """.formatted(safeOtp, expirationMinutes);

    return sendEmail(
        to,
        "Verify your ScholarHub email",
        htmlBody,
        "Use this OTP to verify your email address: "
            + otp
            + ". It expires in "
            + expirationMinutes
            + " minutes.");
  }

  public boolean sendForgotPasswordEmail(String to, String resetCode, long expirationMinutes) {
    String safeResetCode = escapeHtml(resetCode);
    String htmlBody = """
        <p>Use this code to reset your ScholarHub password:</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:6px;margin:24px 0;color:#0f766e;">%s</div>
        <p>This code expires in %d minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
        """.formatted(safeResetCode, expirationMinutes);

    return sendEmail(
        to,
        "Reset your ScholarHub password",
        htmlBody,
        "Use this code to reset your ScholarHub password: "
            + resetCode
            + ". It expires in "
            + expirationMinutes
            + " minutes. If you did not request this, you can ignore this email.");
  }

  public boolean sendEmail(String to, String subject, String body) {
    return sendEmail(to, subject, toHtmlParagraphs(body), body);
  }

  public boolean sendEmail(String to, String subject, String htmlBody, String textBody) {
    if (!isConfigured()) {
      log.error(
          "Skipping email because Brevo API is not configured. Set BREVO_API_KEY and APP_MAIL_FROM. To={} Subject={}",
          to,
          subject);
      return false;
    }

    BrevoEmailRequest request = new BrevoEmailRequest(
        sender,
        List.of(new Recipient(to)),
        subject,
        wrapTemplate(subject, htmlBody),
        textBody);

    try {
      BrevoEmailResponse response = brevoClient.post()
          .uri("/v3/smtp/email")
          .header("api-key", brevoApiKey)
          .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
          .contentType(MediaType.APPLICATION_JSON)
          .body(request)
          .retrieve()
          .body(BrevoEmailResponse.class);

      log.info("Email accepted by Brevo. To={} Subject={} MessageId={}", to, subject, response == null ? null : response.messageId());
      return true;
    } catch (RuntimeException exception) {
      log.error("Brevo email delivery failed. To={} Subject={} Reason={}", to, subject, exception.getMessage(), exception);
      return false;
    }
  }

  public boolean isConfigured() {
    return !isBlank(brevoApiKey) && sender != null && !isBlank(sender.email());
  }

  private Sender parseSender(String value) {
    if (isBlank(value)) {
      return null;
    }

    String trimmedValue = value.trim();
    int openingBracket = trimmedValue.indexOf('<');
    int closingBracket = trimmedValue.indexOf('>');

    if (openingBracket >= 0 && closingBracket > openingBracket) {
      String name = trimmedValue.substring(0, openingBracket).trim();
      String email = trimmedValue.substring(openingBracket + 1, closingBracket).trim();
      return new Sender(isBlank(name) ? DEFAULT_SENDER_NAME : name, email);
    }

    return new Sender(DEFAULT_SENDER_NAME, trimmedValue);
  }

  private String wrapTemplate(String subject, String body) {
    return """
        <!doctype html>
        <html>
          <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
            <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
              <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
                <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;color:#0f172a;">%s</h1>
                <div style="font-size:15px;line-height:1.7;color:#334155;">%s</div>
                <p style="margin:28px 0 0;font-size:13px;color:#64748b;">ScholarHub</p>
              </div>
            </div>
          </body>
        </html>
        """.formatted(escapeHtml(subject), body);
  }

  private String toHtmlParagraphs(String text) {
    if (isBlank(text)) {
      return "";
    }

    return "<p>" + escapeHtml(text).replace("\n\n", "</p><p>").replace("\n", "<br>") + "</p>";
  }

  private String escapeHtml(String value) {
    if (value == null) {
      return "";
    }

    return value
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\"", "&quot;")
        .replace("'", "&#39;");
  }

  private boolean isBlank(String value) {
    return value == null || value.isBlank();
  }

  private record Sender(String name, String email) {
  }

  private record Recipient(String email) {
  }

  private record BrevoEmailRequest(
      Sender sender,
      List<Recipient> to,
      String subject,
      String htmlContent,
      String textContent) {
  }

  private record BrevoEmailResponse(String messageId) {
  }
}
