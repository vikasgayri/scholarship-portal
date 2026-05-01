package com.scholarhub.api.repository;

import com.scholarhub.api.domain.User;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
  Optional<User> findByEmail(String email);

  boolean existsByEmail(String email);

  boolean existsByPhoneNumber(String phoneNumber);

  List<User> findAllByRoleIn(Collection<com.scholarhub.api.domain.Role> roles);
}
