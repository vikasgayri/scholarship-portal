package com.scholarhub.api.service;

import java.time.Instant;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.scholarhub.api.domain.ActivityRecord;
import com.scholarhub.api.dto.ActivityResponse;
import com.scholarhub.api.dto.ApiMappers;
import com.scholarhub.api.repository.ActivityRecordRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ActivityService {
  private final ActivityRecordRepository activityRecordRepository;

  public void log(@NonNull String userId, @NonNull String message) {
    activityRecordRepository.save(ActivityRecord.builder()
        .userId(userId)
        .message(message)
        .createdAt(Instant.now())
        .build());
  }

  public List<ActivityResponse> findRecentByUserId(@NonNull String userId) {
    return activityRecordRepository.findTop6ByUserIdOrderByCreatedAtDesc(userId).stream()
        .map(ApiMappers::toActivityResponse)
        .toList();
  }

  public void deleteAllByUserId(@NonNull String userId) {
    activityRecordRepository.deleteAllByUserId(userId);
  }
}
