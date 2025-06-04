import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isLoggedIn = false;
  user: any = null;
  isScrolled = false;

  constructor(public login: LoginService, private _router: Router) { }

  ngOnInit(): void {
    this.isLoggedIn = this.login.isLoggedIn();
    this.user = this.login.getUser();
    this.login.loginStatusSubject.asObservable().subscribe(data => {
      this.isLoggedIn = this.login.isLoggedIn();
      this.user = this.login.getUser();
    });
  }

  // Listen for scroll events to add/remove the scrolled class
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  public logout() {
    this.login.logout();
    window.location.reload();
  }

  public about(){
    this._router.navigate(['/about'])
  }

  public userLogin(){
    this._router.navigate(['/login'])
  }

  public userRegister(){
    this._router.navigate(['/signup'])
  }

  public handleUserDashboard(){
    if(this.user.authorities[0].authority == 'ADMIN'){
      this._router.navigate(['/admin/profile'])
    }else{
      this._router.navigate(['/user-dashboard/profile'])
    }
  }

}
