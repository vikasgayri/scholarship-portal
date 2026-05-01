package com.scholarhub.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.scholarhub.api.domain.Role;
import com.scholarhub.api.domain.User;
import com.scholarhub.api.dto.RegisterRequest;
import com.scholarhub.api.dto.RegistrationResponse;
import com.scholarhub.api.security.JwtService;
import com.scholarhub.api.repository.UserRepository;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
  @Mock
  private UserRepository userRepository;

  @Mock
  private JwtService jwtService;

  @Mock
  private ActivityService activityService;

  @Mock
  private UserService userService;

  @Mock
  private AuthenticationManager authenticationManager;

  @Mock
  private NotificationService notificationService;

  @InjectMocks
  private AuthService authService;

  @Test
  void registerCreatesUserAccountAndReturnsVerificationChallenge() {
    RegisterRequest request = new RegisterRequest(
        "Vikas",
        "vikas@example.com",
        "secure123",
        "B.Tech",
        "9999999999",
        "Delhi",
        "Delhi");

    when(userRepository.existsByEmail("vikas@example.com")).thenReturn(false);
    when(userRepository.existsByPhoneNumber("9999999999")).thenReturn(false);
    when(userService.encodePassword("secure123")).thenReturn("hashed-password");
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
      User user = invocation.getArgument(0);
      user.setId("user-1");
      user.setCreatedAt(Instant.now());
      user.setUpdatedAt(Instant.now());
      return user;
    });

    RegistrationResponse response = authService.register(request);

    ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
    verify(userRepository).save(userCaptor.capture());
    verify(activityService).log("user-1", "Account created successfully. Verification pending.");
    verify(notificationService).sendRegistrationSuccess(any(User.class));
    verify(notificationService).sendEmailVerificationOtp(any(User.class), anyString());

    User savedUser = userCaptor.getValue();
    assertThat(savedUser.getRole()).isEqualTo(Role.USER);
    assertThat(savedUser.getPasswordHash()).isEqualTo("hashed-password");
    assertThat(response.user().email()).isEqualTo("vikas@example.com");
    assertThat(response.verification().emailVerified()).isFalse();
  }

  @Test
  void registerRejectsDuplicateEmail() {
    when(userRepository.existsByEmail("vikas@example.com")).thenReturn(true);

    assertThatThrownBy(() -> authService.register(new RegisterRequest(
        "Vikas",
        "vikas@example.com",
        "secure123",
        "B.Tech",
        "9999999999",
        "Delhi",
        "Delhi")))
        .isInstanceOf(ApiException.class)
        .hasMessageContaining("already exists");
  }
}
