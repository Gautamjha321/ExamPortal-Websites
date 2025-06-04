package com.exam.examportal.services;

import com.exam.examportal.models.User;
import com.exam.examportal.models.UserRole;

import java.util.Set;

public interface UserService {

    //create user
    public User createUser(User user, Set<UserRole> userRoles) throws Exception;

    // get User
    public User getUser(String userName);

    //Delete user
    public void deleteUser(Long id);

}
