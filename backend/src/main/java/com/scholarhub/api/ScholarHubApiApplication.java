package com.scholarhub.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ScholarHubApiApplication {

  public static void main(String[] args) {
    SpringApplication.run(ScholarHubApiApplication.class, args);
  }
}
