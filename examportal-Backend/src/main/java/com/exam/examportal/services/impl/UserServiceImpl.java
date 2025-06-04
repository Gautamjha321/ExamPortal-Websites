package com.exam.examportal.services.impl;

import com.exam.examportal.helper.UserFoundException;
import com.exam.examportal.models.User;
import com.exam.examportal.models.UserRole;
import com.exam.examportal.repos.RoleRepository;
import com.exam.examportal.repos.UserRepository;
import com.exam.examportal.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;


    // creating user
    @Override
    public User createUser(User user, Set<UserRole> userRoles) throws Exception {

        User local = this.userRepository.findByUsername(user.getUsername());

        if(local != null){
            System.out.println("User already exist");
            throw new UserFoundException();
        }else {
            // create user

            for(UserRole userRole : userRoles){
                roleRepository.save(userRole.getRole());
            }

            user.getUserRoles().addAll(userRoles);
            local = this.userRepository.save(user);
        }

        return local;
    }

    @Override
    public User getUser(String userName) {

        return this.userRepository.findByUsername(userName);
    }

    @Override
    public void deleteUser(Long id) {
        this.userRepository.deleteById(id);
    }


}
