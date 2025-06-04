import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginData = {
    "username": "",
    "password": ""
  }

  // Property for toggling password visibility
  hidePassword = true;

  constructor(private snack: MatSnackBar, private login: LoginService, private router: Router) { }

  formSubmit() {
    console.log("login button click");

    if (this.loginData.username.trim() == '' || this.loginData.username == null) {
      this.snack.open('Username is required..!!', '', {
        duration: 3000
      })
      return;
    }

    if (this.loginData.password.trim() == '' || this.loginData.password == null) {
      this.snack.open('Password is required..!!', '', {
        duration: 3000
      })
      return;
    }

    //request to generate token

    this.login.generateToken(this.loginData).subscribe((data: any) => {
      console.log("Success");
      console.log(data);

      // login user
      this.login.loginUser(data.token)

      this.login.getCurrentUser().subscribe(

        (user: any) => {
          this.login.setUser(user);
          console.log(user);

          // redirect to admin
          if (this.login.getUserRole() === 'ADMIN') {
            // ADMIN USER
            // window.location.href = '/admin'
            this.router.navigate(['admin']);

            this.login.loginStatusSubject.next(true)
          } else if (this.login.getUserRole() === 'PARTICIPANTS') {
            // Normal User
            // window.location.href = '/user-dashboard'
            this.router.navigate(['user-dashboard/0'])
            this.login.loginStatusSubject.next(true)

          }else{
            this.login.logout();
            
          }

        }
      )

    },
      (error) => {
        console.log("Error..!!");
        console.log(error);
        this.snack.open("Invalid details..!!", '', {
          duration: 3000,
        })
      }
    )
  }

}
