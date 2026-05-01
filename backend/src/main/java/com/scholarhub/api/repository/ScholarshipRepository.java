package com.scholarhub.api.repository;

import com.scholarhub.api.domain.Scholarship;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ScholarshipRepository extends MongoRepository<Scholarship, String> {
  List<Scholarship> findAllByOrderByFeaturedDescDeadlineAsc();
}
