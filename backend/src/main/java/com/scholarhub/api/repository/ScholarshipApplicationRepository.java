package com.scholarhub.api.repository;

import com.scholarhub.api.domain.ScholarshipApplication;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ScholarshipApplicationRepository extends MongoRepository<ScholarshipApplication, String> {
  boolean existsByScholarshipIdAndStudentId(String scholarshipId, String studentId);

  List<ScholarshipApplication> findAllByStudentIdOrderByUpdatedAtDesc(String studentId);

  long countByStudentId(String studentId);

  void deleteAllByStudentId(String studentId);
}
