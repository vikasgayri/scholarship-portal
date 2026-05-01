package com.scholarhub.api.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.scholarhub.api.domain.DocumentStatus;
import com.scholarhub.api.domain.StudentDocument;
import com.scholarhub.api.dto.ApiMappers;
import com.scholarhub.api.dto.DocumentResponse;
import com.scholarhub.api.repository.StudentDocumentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentService {
  private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
      "application/pdf",
      "image/png",
      "image/jpeg");

  public record DocumentFile(Resource resource, String fileName, String contentType) {
  }

  private final StudentDocumentRepository studentDocumentRepository;
  private final StorageService storageService;
  private final ActivityService activityService;

  public DocumentResponse upload(@NonNull String userId, @NonNull String category, @NonNull MultipartFile file) {
    return upload(userId, null, category, file);
  }

  public DocumentResponse uploadForApplication(
      @NonNull String userId,
      @NonNull String applicationId,
      @NonNull String category,
      @NonNull MultipartFile file) {
    return upload(userId, applicationId, category, file);
  }

  private DocumentResponse upload(
      @NonNull String userId,
      String applicationId,
      @NonNull String category,
      @NonNull MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new ApiException("Choose a file to upload.");
    }

    String contentType = file.getContentType();

    if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
      throw new ApiException("Only PDF, PNG, and JPG files are allowed.");
    }

    String storedFileName = storageService.store(file);

    StudentDocument document = studentDocumentRepository.save(
        StudentDocument.builder()
            .userId(userId)
            .applicationId(applicationId)
            .name(file.getOriginalFilename())
            .storedFileName(storedFileName)
            .filePath("uploads/" + storedFileName)
            .category(category == null || category.isBlank() ? "General" : category.trim())
            .contentType(contentType)
            .size(file.getSize())
            .status(DocumentStatus.PENDING)
            .uploadedAt(Instant.now())
            .build());

    activityService.log(userId, "Document uploaded: " + document.getName() + ".");
    return ApiMappers.toDocumentResponse(document);
  }

  public List<DocumentResponse> findByUserId(String userId) {
    return studentDocumentRepository.findAllByUserIdOrderByUploadedAtDesc(userId).stream()
        .map(ApiMappers::toDocumentResponse)
        .toList();
  }

  public List<DocumentResponse> findAll() {
    return studentDocumentRepository.findAll().stream()
        .sorted(Comparator.comparing(StudentDocument::getUploadedAt).reversed())
        .map(ApiMappers::toDocumentResponse)
        .toList();
  }

  public DocumentResponse updateStatus(@NonNull String documentId, DocumentStatus status) {
    StudentDocument document = studentDocumentRepository.findById(documentId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document was not found."));

    document.setStatus(status);
    StudentDocument updatedDocument = studentDocumentRepository.save(document);
    activityService.log(document.getUserId(), document.getName() + " was marked as " + status.name().toLowerCase() + ".");
    return ApiMappers.toDocumentResponse(updatedDocument);
  }

  public DocumentFile loadForUser(String userId, String documentId) {
    StudentDocument document = studentDocumentRepository.findByIdAndUserId(documentId, userId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document was not found."));
    return toDocumentFile(document);
  }

  public DocumentFile loadForAdmin(String documentId) {
    StudentDocument document = findDocument(documentId);
    return toDocumentFile(document);
  }

  public DocumentFile loadByStoredFileName(String userId, boolean admin, String storedFileName) {
    StudentDocument document = studentDocumentRepository.findByStoredFileName(storedFileName)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document was not found."));

    if (!admin && !document.getUserId().equals(userId)) {
      throw new ApiException(HttpStatus.FORBIDDEN, "You do not have permission to view this document.");
    }

    return toDocumentFile(document);
  }

  public void deleteForUser(String userId, String documentId) {
    StudentDocument document = studentDocumentRepository.findByIdAndUserId(documentId, userId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document was not found."));
    delete(document);
    activityService.log(userId, "Document deleted: " + document.getName() + ".");
  }

  public void deleteByAdmin(String documentId) {
    StudentDocument document = findDocument(documentId);
    delete(document);
    activityService.log(document.getUserId(), "Document deleted by admin: " + document.getName() + ".");
  }

  public void deleteAllByUserId(String userId) {
    studentDocumentRepository.findAllByUserId(userId)
        .forEach(document -> storageService.delete(document.getStoredFileName()));
    studentDocumentRepository.deleteAllByUserId(userId);
  }

  public long countByUserId(String userId) {
    return studentDocumentRepository.countByUserId(userId);
  }

  public long countPendingDocuments() {
    return studentDocumentRepository.findAll().stream()
        .filter(document -> document.getStatus() == DocumentStatus.PENDING)
        .count();
  }

  private StudentDocument findDocument(@NonNull String documentId) {
    return studentDocumentRepository.findById(documentId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document was not found."));
  }

  private void delete(StudentDocument document) {
    storageService.delete(document.getStoredFileName());
    studentDocumentRepository.deleteById(document.getId());
  }

  private DocumentFile toDocumentFile(StudentDocument document) {
    return new DocumentFile(
        storageService.loadAsResource(document.getStoredFileName()),
        document.getName(),
        document.getContentType() == null ? "application/octet-stream" : document.getContentType());
  }
}
