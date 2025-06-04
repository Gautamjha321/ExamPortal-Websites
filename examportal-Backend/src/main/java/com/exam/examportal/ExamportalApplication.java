package com.exam.examportal;

import com.exam.examportal.helper.UserFoundException;
import com.exam.examportal.models.Role;
import com.exam.examportal.models.User;
import com.exam.examportal.models.UserRole;
import com.exam.examportal.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@SpringBootApplication
public class ExamportalApplication implements CommandLineRunner {

	@Autowired
	private UserService userService;

	@Autowired
	private BCryptPasswordEncoder bCryptPasswordEncoder;

	public static void main(String[] args) {
		SpringApplication.run(ExamportalApplication.class, args);

	}

	@Override
	public void run(String... args) throws Exception {
		
		
		System.out.println("starting user");

		try{
			User user = new User();
			user.setFirstname("Gautam");
			user.setLastname("jha");
			user.setEmail("abc@gmail.com");
			user.setPassword(this.bCryptPasswordEncoder.encode("abc"));
			user.setUsername("Gautamjha@321");
			user.setProfile("Gautam.png");

			Role role = new Role();
			role.setRoleId(44L);
			role.setRoleName("ADMIN");

			Set<UserRole> userRoleSet = new HashSet<>();

			UserRole userRole = new UserRole();
			userRole.setRole(role);
			userRole.setUser(user);

			userRoleSet.add(userRole);

			User user1 = this.userService.createUser(user, userRoleSet);
			System.out.println(user1.getUsername());
		}catch (UserFoundException e){
			e.printStackTrace();
		}
	}
}
