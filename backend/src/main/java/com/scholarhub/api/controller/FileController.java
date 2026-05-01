package com.scholarhub.api.controller;

import com.scholarhub.api.domain.Role;
import com.scholarhub.api.security.UserPrincipal;
import com.scholarhub.api.service.DocumentService;
import com.scholarhub.api.service.DocumentService.DocumentFile;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
  private final DocumentService documentService;

  @GetMapping("/{filename:.+}")
  public ResponseEntity<Resource> file(
      @AuthenticationPrincipal UserPrincipal userPrincipal,
      @PathVariable String filename,
      @RequestParam(defaultValue = "view") String mode) {
    DocumentFile documentFile = documentService.loadByStoredFileName(
        userPrincipal.getId(),
        userPrincipal.getRole() == Role.ADMIN,
        filename);
    String disposition = "download".equalsIgnoreCase(mode) ? "attachment" : "inline";

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(Objects.requireNonNull(documentFile.contentType(), "Content type is required")))
        .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + documentFile.fileName() + "\"")
        .body(documentFile.resource());
  }
}
