package com.scholarhub.api.config;

import java.lang.reflect.Method;
import java.util.concurrent.Executor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@Slf4j
public class AsyncConfig implements AsyncConfigurer {
  @Bean(name = "emailTaskExecutor")
  public Executor emailTaskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(2);
    executor.setMaxPoolSize(6);
    executor.setQueueCapacity(100);
    executor.setThreadNamePrefix("email-");
    executor.initialize();
    return executor;
  }

  @Override
  public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
    return new AsyncUncaughtExceptionHandler() {
      @Override
      public void handleUncaughtException(Throwable exception, Method method, Object... params) {
        log.error("Async task failed. Method={} Reason={}", method.getName(), exception.getMessage(), exception);
      }
    };
  }
}
