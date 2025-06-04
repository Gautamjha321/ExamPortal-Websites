import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService } from 'src/app/services/category.service';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar-user',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  categories;
  constructor(
    private _cat: CategoryService, 
    private _snack: MatSnackBar,
    private _login: LoginService,
    private _router: Router
  ){}

  ngOnInit() : void{
    this._cat.categories().subscribe(
      (data: any) =>{
        this.categories = data;
      },
      (error) =>{
        console.log(error);
        this._snack.open("Error in loading data", '', {
          duration: 3000
        })
      }
    )
  }

  logout() {
    this._login.logout();
    this._snack.open('Logged out successfully', '', {
      duration: 3000,
    });
    this._router.navigate(['login']);
  }
}
