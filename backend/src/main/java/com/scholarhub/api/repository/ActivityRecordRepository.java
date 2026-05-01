package com.scholarhub.api.repository;

import com.scholarhub.api.domain.ActivityRecord;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ActivityRecordRepository extends MongoRepository<ActivityRecord, String> {
  List<ActivityRecord> findTop6ByUserIdOrderByCreatedAtDesc(String userId);

  void deleteAllByUserId(String userId);
}
