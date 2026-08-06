package com.scholarhub.api.controller;

import com.scholarhub.api.dto.ApiResponse;
import com.scholarhub.api.dto.AuthRequest;
import com.scholarhub.api.dto.AuthResponse;
import com.scholarhub.api.dto.ForgotPasswordRequest;
import com.scholarhub.api.dto.RegisterRequest;
import com.scholarhub.api.dto.RegistrationResponse;
import com.scholarhub.api.dto.ResetOtpRequest;
import com.scholarhub.api.dto.ResetPasswordRequest;
import com.scholarhub.api.dto.UserProfileResponse;
import com.scholarhub.api.dto.VerificationRequest;
import com.scholarhub.api.dto.VerificationResendRequest;
import com.scholarhub.api.dto.VerificationStatusResponse;
import com.scholarhub.api.security.UserPrincipal;
import com.scholarhub.api.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
  private final AuthService authService;

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<RegistrationResponse> register(@Valid @RequestBody RegisterRequest request) {
    return ApiResponse.success(
        "Account created. Verify your email before logging in.",
        authService.register(request));
  }

  @PostMapping("/login")
  public ApiResponse<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
    return ApiResponse.success("Login successful.", authService.login(request));
  }

  @PostMapping("/verify-email")
  public ApiResponse<VerificationStatusResponse> verifyEmail(
      @Valid @RequestBody VerificationRequest request) {
    return ApiResponse.success("Email verified successfully.", authService.verifyEmail(request));
  }

  @PostMapping("/resend-email-otp")
  public ApiResponse<VerificationStatusResponse> resendEmailOtp(
      @Valid @RequestBody VerificationResendRequest request) {
    return ApiResponse.success("Email verification OTP sent.", authService.resendEmailOtp(request));
  }

  @PostMapping("/forgot-password")
  public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    authService.forgotPassword(request);
    return ApiResponse.success("OTP has been sent to your registered email.", null);
  }

  @PostMapping("/verify-reset-otp")
  public ApiResponse<Void> verifyResetOtp(@Valid @RequestBody ResetOtpRequest request) {
    authService.verifyResetOtp(request);
    return ApiResponse.success("OTP verified successfully.", null);
  }

  @PostMapping("/reset-password")
  public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    authService.resetPassword(request);
    return ApiResponse.success("Password changed successfully.", null);
  }

  @GetMapping("/me")
  public ApiResponse<UserProfileResponse> me(@AuthenticationPrincipal UserPrincipal userPrincipal) {
    return ApiResponse.success("Current user loaded.", authService.currentUser(userPrincipal.getId()));
  }
}
