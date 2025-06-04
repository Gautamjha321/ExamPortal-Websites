import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  user = null;
  constructor(private login: LoginService){}
  // user = this.login.getUser();
  ngOnInit(): void{
    this.user = this.login.getUser();
  }
  
}
