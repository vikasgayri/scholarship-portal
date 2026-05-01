package com.scholarhub.api.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.scholarhub.api.domain.Role;
import com.scholarhub.api.domain.User;
import com.scholarhub.api.dto.AdminUserResponse;
import com.scholarhub.api.dto.ApiMappers;
import com.scholarhub.api.dto.ProfileUpdateRequest;
import com.scholarhub.api.dto.UserProfileResponse;
import com.scholarhub.api.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
  private final UserRepository userRepository;
  private final ActivityService activityService;
  private final PasswordEncoder passwordEncoder;

  public User findById(@NonNull String userId) {
    return userRepository.findById(userId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User account was not found."));
  }

  public User findByEmail(@NonNull String email) {
    return userRepository.findByEmail(email.toLowerCase())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User account was not found."));
  }

  public UserProfileResponse getProfile(@NonNull String userId) {
    return ApiMappers.toUserProfile(findById(userId));
  }

  public UserProfileResponse updateProfile(@NonNull String userId, ProfileUpdateRequest request) {
    User user = findById(userId);
    String normalizedPhoneNumber = normalizePhoneNumber(request.phoneNumber());

    if (!normalizedPhoneNumber.equals(user.getPhoneNumber())
        && userRepository.existsByPhoneNumber(normalizedPhoneNumber)) {
      throw new ApiException(HttpStatus.CONFLICT, "An account with this phone number already exists.");
    }

    user.setName(request.name().trim());
    user.setCourse(request.course().trim());
    if (!normalizedPhoneNumber.equals(user.getPhoneNumber())) {
      user.setPhoneNumber(normalizedPhoneNumber);
    }
    user.setCity(request.city().trim());
    user.setState(request.state().trim());
    user.setProfileComplete(isProfileComplete(user));
    user.setUpdatedAt(Instant.now());

    User updatedUser = userRepository.save(user);
    activityService.log(userId, "Profile details were updated.");

    return ApiMappers.toUserProfile(updatedUser);
  }

  public long countStudents() {
    return userRepository.findAllByRoleIn(List.of(Role.USER, Role.STUDENT)).size();
  }

  public List<AdminUserResponse> findAllUsers() {
    return userRepository.findAll().stream()
        .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
        .map(ApiMappers::toAdminUser)
        .toList();
  }

  public void deleteUser(@NonNull String userId) {
    User user = findDeletableUser(userId);
    userRepository.deleteById(user.getId());
  }

  public User findDeletableUser(@NonNull String userId) {
    User user = findById(userId);
    if (user.getRole() == Role.ADMIN) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Admin accounts cannot be deleted from this panel.");
    }
    return user;
  }

  public void deleteOwnAccount(@NonNull String userId) {
    User user = findById(userId);
    userRepository.deleteById(user.getId());
  }

  public boolean isProfileComplete(User user) {
    return !isBlank(user.getName())
        && !isBlank(user.getCourse())
        && !isBlank(user.getPhoneNumber())
        && !isBlank(user.getCity())
        && !isBlank(user.getState());
  }

  public String encodePassword(String password) {
    return passwordEncoder.encode(password);
  }

  private boolean isBlank(String value) {
    return value == null || value.isBlank();
  }

  private String normalizePhoneNumber(String phoneNumber) {
    return phoneNumber.trim().replace(" ", "").replace("-", "");
  }

}
