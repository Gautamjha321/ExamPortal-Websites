import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent{

  public user={
    username: '',
    password: '',
    firstname: '',
    lastname: '',
    email: '',
    phone:''
  }

  // Property for toggling password visibility
  hidePassword = true;
  
  constructor(private userService: UserService, private snack:MatSnackBar){}

  // ngOnInit(): void {
  //   throw new Error('Method not implemented.');
  // }

  formSubmit(){
    if(this.user.username == '' || this.user.username == null){
      this.snack.open('Username is required..!!', '', {
        duration:3000,
        verticalPosition:'top',
        horizontalPosition: 'right'
      })
      return
    }

    // if(this.user.password == '' || this.user.password == null){
    //   alert('Password is required')
    //   return;
    // }

    // if(this.user.firstName == '' || this.user.firstName == null){
    //   alert('First Name is required')
    //   return
    // }

    // if(this.user.lastName == '' || this.user.lastName == null){
    //   alert('Last Name is required')
    //   return
    // }

    // if(this.user.email == '' || this.user.email == null){
    //   alert('Email is required')
    //   return
    // }

    // if(this.user.phoneNumber.length !== 10){
    //   alert('Number should be in 10 letters')
    //   return
    // }

    console.log(this.user);
    this.userService.addUser(this.user).subscribe(
      (data)=>{
        // Success
        console.log(data);
        // alert('successfully registered');
        Swal.fire('Success','User is registered','success')

      },
      (error)=>{
        //error
        console.log(error);
        alert('Something went wrong');
        
      }
    )
  }

}
