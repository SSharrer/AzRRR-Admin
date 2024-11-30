import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { isNil } from "lodash";

import { AuthService } from "../services/auth.service";
import { AppService } from "../services/app.service";

import { LoginRequest, LoginRequestResult, LoginRequestStatus } from "../requests/login.request";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  
  form: FormGroup<IFormModel>;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.form = this.fb.group<IFormModel>({
      password: new FormControl<string>(null, [ Validators.required ])
    });
  }

  // button handlers

  onClickLogin(): void {
    if (this.canLogin) {
      const request = new LoginRequest();
      request.password = this.form.controls.password.value;

      this.appService.incrementBusyCounter();
      this.authService.login(request).subscribe({
        next: result => {
          this.appService.decrementBusyCounter();
          this.processLoginResult(result);
        },
        error: () => {
          this.appService.decrementBusyCounter();
          window.alert('There was an error processing your request!');
        }
      })
    }
  }

  // ui helpers

  get canLogin(): boolean {
    return this.form.valid;
  }

  // private methods

  processLoginResult(result: LoginRequestResult): void {
    if (result?.status === LoginRequestStatus.successful && !isNil(result.token)) {
      this.authService.setAuthToken(result.token);
      this.authService.setOrg(result.org);
      this.router.navigateByUrl('/home');
    } else if (result?.status === LoginRequestStatus.invalidPassword) {
      window.alert('Invalid password?  Code?');
    } else {
      window.alert('There was an error processing your request!');
    }
  }
}

interface IFormModel {
  password: FormControl<string>;
}