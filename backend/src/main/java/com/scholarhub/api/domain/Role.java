package com.scholarhub.api.domain;

public enum Role {
  USER,
  ADMIN,
  STUDENT;

  public Role normalized() {
    return this == STUDENT ? USER : this;
  }
}
