package com.scholarhub.api.service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.scholarhub.api.domain.Scholarship;
import com.scholarhub.api.domain.ScholarshipStatus;
import com.scholarhub.api.dto.ApiMappers;
import com.scholarhub.api.dto.ScholarshipRequest;
import com.scholarhub.api.dto.ScholarshipResponse;
import com.scholarhub.api.repository.ScholarshipRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScholarshipService {
  private final ScholarshipRepository scholarshipRepository;

  public List<ScholarshipResponse> listPublicScholarships(String query) {
    String normalizedQuery = query == null ? "" : query.trim().toLowerCase();

    return scholarshipRepository.findAllByOrderByFeaturedDescDeadlineAsc().stream()
        .filter(scholarship -> scholarship.getStatus() == ScholarshipStatus.OPEN)
        .filter(scholarship -> !scholarship.getDeadline().isBefore(LocalDate.now()))
        .filter(scholarship -> normalizedQuery.isBlank()
            || ("%s %s %s".formatted(
                    scholarship.getTitle(),
                    scholarship.getProvider(),
                    scholarship.getCategory()))
                .toLowerCase()
                .contains(normalizedQuery))
        .map(ApiMappers::toScholarshipResponse)
        .toList();
  }

  public List<ScholarshipResponse> listFeaturedScholarships() {
    return listPublicScholarships("").stream()
        .filter(ScholarshipResponse::featured)
        .limit(3)
        .toList();
  }

  public List<ScholarshipResponse> listAllScholarships() {
    return scholarshipRepository.findAll().stream()
        .sorted(Comparator.comparing(Scholarship::isFeatured).reversed()
            .thenComparing(Scholarship::getDeadline))
        .map(ApiMappers::toScholarshipResponse)
        .toList();
  }

  public Scholarship findById(@NonNull String scholarshipId) {
    return scholarshipRepository.findById(scholarshipId)
        .orElseThrow(() -> new ApiException("Scholarship was not found."));
  }

  public long countOpenScholarships() {
    return scholarshipRepository.findAll().stream()
        .filter(scholarship -> scholarship.getStatus() == ScholarshipStatus.OPEN)
        .count();
  }

  public ScholarshipResponse createScholarship(ScholarshipRequest request) {
    Scholarship scholarship = scholarshipRepository.save(mapRequestToScholarship(null, request));
    return ApiMappers.toScholarshipResponse(scholarship);
  }

  public ScholarshipResponse updateScholarship(@NonNull String scholarshipId, ScholarshipRequest request) {
    Scholarship existingScholarship = findById(scholarshipId);
    Scholarship updatedScholarship = scholarshipRepository.save(
        mapRequestToScholarship(existingScholarship, request));
    return ApiMappers.toScholarshipResponse(updatedScholarship);
  }

  private Scholarship mapRequestToScholarship(
      Scholarship existingScholarship,
      ScholarshipRequest request) {
    Instant createdAt = existingScholarship == null ? Instant.now() : existingScholarship.getCreatedAt();

    return Scholarship.builder()
        .id(existingScholarship == null ? null : existingScholarship.getId())
        .title(request.title().trim())
        .provider(request.provider().trim())
        .description(request.description().trim())
        .eligibility(request.eligibility().trim())
        .category(request.category().trim())
        .amount(request.amount())
        .seats(request.seats())
        .deadline(request.deadline())
        .status(request.status())
        .featured(request.featured())
        .location(request.location().trim())
        .createdAt(createdAt)
        .updatedAt(Instant.now())
        .build();
  }
}
