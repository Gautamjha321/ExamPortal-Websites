import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user = null;
  isLoading = true;
  
  constructor(
    private login: LoginService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadUserData();
  }
  
  loadUserData() {
    this.isLoading = true;
    
    try {
      // Get user data from localStorage via service
      const userData = this.login.getUser();
      
      // Log for debugging
      console.log('User data from localStorage:', userData);
      
      if (userData) {
        this.user = userData;
        this.isLoading = false;
      } else {
        this.handleError('User data not found');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.handleError('Error loading profile data');
    }
  }
  
  handleError(message: string) {
    this.isLoading = false;
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }
  
  // Method to handle edit profile action
  editProfile(): void {
    console.log('Edit profile clicked');
    // Implement edit profile logic here
  }
  
  // Method to handle change password action
  changePassword(): void {
    console.log('Change password clicked');
    // Implement change password logic here
  }
  
  // Method to handle view history action
  viewHistory(): void {
    console.log('View history clicked');
    // Implement view history logic here
  }
}
