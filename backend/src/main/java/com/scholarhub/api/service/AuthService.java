package com.scholarhub.api.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.scholarhub.api.domain.Role;
import com.scholarhub.api.domain.User;
import com.scholarhub.api.dto.ApiMappers;
import com.scholarhub.api.dto.AuthRequest;
import com.scholarhub.api.dto.AuthResponse;
import com.scholarhub.api.dto.RegisterRequest;
import com.scholarhub.api.dto.RegistrationResponse;
import com.scholarhub.api.dto.UserProfileResponse;
import com.scholarhub.api.dto.VerificationRequest;
import com.scholarhub.api.dto.VerificationResendRequest;
import com.scholarhub.api.dto.VerificationStatusResponse;
import com.scholarhub.api.repository.UserRepository;
import com.scholarhub.api.security.JwtService;
import com.scholarhub.api.security.UserPrincipal;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final UserRepository userRepository;
  private final JwtService jwtService;
  private final ActivityService activityService;
  private final UserService userService;
  private final AuthenticationManager authenticationManager;
  private final NotificationService notificationService;

  @Value("${app.verification.otp-expiration-minutes}")
  private long otpExpirationMinutes;

  public RegistrationResponse register(@NonNull RegisterRequest request) {
    String normalizedEmail = normalizeEmail(request.email());
    String normalizedPhoneNumber = normalizePhoneNumber(request.phoneNumber());

    if (userRepository.existsByEmail(normalizedEmail)) {
      throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists.");
    }

    if (userRepository.existsByPhoneNumber(normalizedPhoneNumber)) {
      throw new ApiException(HttpStatus.CONFLICT, "An account with this phone number already exists.");
    }

    User user = User.builder()
        .name(request.name().trim())
        .email(normalizedEmail)
        .passwordHash(userService.encodePassword(request.password()))
        .role(Role.USER)
        .course(request.course().trim())
        .phoneNumber(normalizedPhoneNumber)
        .city(request.city().trim())
        .state(request.state().trim())
        .profileComplete(true)
        .emailVerified(false)
        .createdAt(Instant.now())
        .updatedAt(Instant.now())
        .build();

    issueFreshEmailVerificationCode(user);
    User savedUser = userRepository.save(user);
    activityService.log(savedUser.getId(), "Account created successfully. Verification pending.");
    notificationService.sendRegistrationSuccess(savedUser);
    notificationService.sendEmailVerificationOtp(savedUser, savedUser.getEmailVerificationOtp());

    return new RegistrationResponse(
        ApiMappers.toUserProfile(savedUser),
        buildVerificationStatus(savedUser));
  }

  public AuthResponse login(AuthRequest request) {
    String normalizedEmail = normalizeEmail(request.email());

    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(normalizedEmail, request.password()));

    User user = userRepository.findByEmail(normalizedEmail)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

    if (!user.isEmailVerified()) {
      throw new ApiException(
          HttpStatus.FORBIDDEN,
          "Verify your email address before logging in.");
    }

    user.setLastLoginAt(Instant.now());
    user.setUpdatedAt(Instant.now());
    User updatedUser = userRepository.save(user);

    activityService.log(updatedUser.getId(), "Signed in to ScholarHub.");
    return buildAuthResponse(updatedUser);
  }

  public VerificationStatusResponse verifyEmail(VerificationRequest request) {
    User user = findByEmail(request.email());
    validateOtp(
        user.getEmailVerificationOtp(),
        user.getEmailVerificationOtpExpiresAt(),
        request.otp(),
        "email");

    user.setEmailVerified(true);
    user.setEmailVerificationOtp(null);
    user.setEmailVerificationOtpExpiresAt(null);
    user.setUpdatedAt(Instant.now());

    User updatedUser = userRepository.save(user);
    activityService.log(updatedUser.getId(), "Email address verified.");
    return buildVerificationStatus(updatedUser);
  }

  public VerificationStatusResponse resendEmailOtp(VerificationResendRequest request) {
    User user = findByEmail(request.email());

    if (!user.isEmailVerified()) {
      user.setEmailVerificationOtp(generateOtp());
      user.setEmailVerificationOtpExpiresAt(nextOtpExpiry());
      user.setUpdatedAt(Instant.now());
      user = userRepository.save(user);
      notificationService.sendEmailVerificationOtp(user, user.getEmailVerificationOtp());
      activityService.log(user.getId(), "Email verification OTP reissued.");
    }

    return buildVerificationStatus(user);
  }

  public UserProfileResponse currentUser(String userId) {
    return userService.getProfile(userId);
  }

  public VerificationStatusResponse verificationStatusForUser(User user) {
    return buildVerificationStatus(user);
  }

  private AuthResponse buildAuthResponse(User user) {
    UserPrincipal userPrincipal = new UserPrincipal(user);
    return new AuthResponse(
        jwtService.generateToken(userPrincipal),
        "Bearer",
        jwtService.expiresAt(),
        ApiMappers.toUserProfile(user));
  }

  private User findByEmail(String email) {
    return userRepository.findByEmail(normalizeEmail(email))
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User account was not found."));
  }

  private void issueFreshEmailVerificationCode(User user) {
    user.setEmailVerificationOtp(generateOtp());
    user.setEmailVerificationOtpExpiresAt(nextOtpExpiry());
  }

  private void validateOtp(String expectedOtp, Instant expiresAt, String providedOtp, String label) {
    if (expectedOtp == null || expiresAt == null || expiresAt.isBefore(Instant.now())) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "Your " + label + " verification OTP has expired. Please request a new one.");
    }

    if (!expectedOtp.equals(providedOtp.trim())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid " + label + " verification OTP.");
    }
  }

  private VerificationStatusResponse buildVerificationStatus(User user) {
    return new VerificationStatusResponse(
        user.getEmail(),
        user.isEmailVerified(),
        maskEmail(user.getEmail()),
        shouldExposeFallbackEmailOtp(user) ? user.getEmailVerificationOtp() : null);
  }

  private boolean shouldExposeFallbackEmailOtp(User user) {
    return !user.isEmailVerified() && !notificationService.isMailConfigured();
  }

  private String normalizeEmail(String email) {
    return email.trim().toLowerCase();
  }

  private String normalizePhoneNumber(String phoneNumber) {
    return phoneNumber.trim().replace(" ", "").replace("-", "");
  }

  private String generateOtp() {
    return String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1_000_000));
  }

  private Instant nextOtpExpiry() {
    return Instant.now().plus(otpExpirationMinutes, ChronoUnit.MINUTES);
  }

  private String maskEmail(String email) {
    int atIndex = email.indexOf('@');

    if (atIndex <= 1) {
      return email;
    }

    return email.substring(0, 1) + "***" + email.substring(atIndex - 1);
  }

}
