package com.exam.examportal.controllers;

import com.exam.examportal.helper.UserFoundException;

import com.exam.examportal.models.Role;
import com.exam.examportal.models.User;
import com.exam.examportal.models.UserRole;
import com.exam.examportal.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;

@RestController
@RequestMapping(path = "/user")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;


    @GetMapping(path = "/test")
    public String test(){
        return "Welcome to backend api of Exam portal";
    }

    //create user
    @PostMapping(path = "/")
    public User createUser(@RequestBody User user) throws Exception {

        user.setProfile("default.png");

        //Encoding password with BCryptPasswordEncoder
        user.setPassword(this.bCryptPasswordEncoder.encode(user.getPassword()));


        Set<UserRole> userRoles = new HashSet<>();
        Role role = new Role();
        role.setRoleId(45L);
        role.setRoleName("PARTICIPANTS");

        UserRole userRole = new UserRole();
        userRole.setUser(user);
        userRole.setRole(role);

        userRoles.add(userRole);

        return this.userService.createUser(user, userRoles);
    }

    @GetMapping("/{username}")
    public User getUser(@PathVariable("username") String username){

        return this.userService.getUser(username);
    }

    //Delete user by id
    @DeleteMapping(path = "/{userId}")
    public void deleteUser(@PathVariable("userId") Long userId){
        this.userService.deleteUser(userId);
    }

//    @ExceptionHandler(UserFoundException.class)
//    public ResponseEntity<?> exceptionHandler(UserFoundException e){
//        return e.fillInStackTrace();
//    }
}
