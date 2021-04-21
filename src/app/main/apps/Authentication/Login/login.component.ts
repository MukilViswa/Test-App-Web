import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Renderer2, ElementRef, AfterViewInit, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { Http, Response, HttpModule } from '@angular/http';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { WindowService } from '@fuse/services/window.service';
import { GlobalService } from '@fuse/services/globals.service';
import { TranslateService } from '@ngx-translate/core';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import {LoginService} from 'app/main/apps/Authentication/Login/login.service';
import { environment } from 'environments/environment';


declare var $: any;

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class LoginComponent implements OnInit {
    ​
    windowRef: any;
    loginForms: FormGroup;
    signInForms: FormGroup;
    accessArray:any = [];
    isSignUp:boolean = false;
    submittedForm: any;
    constructor(
        private win: WindowService,
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _translateService: TranslateService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private cd: ChangeDetectorRef,
        private http: Http,
        private activatedRoute: ActivatedRoute,
        private route: Router,
        private loginService: LoginService,
        private renderer: Renderer2,
        private snackBar: MatSnackBar,
        private spinner: NgxSpinnerService,
        public global: GlobalService,
    ) {
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };

        this.loginForms = this._formBuilder.group({
            loginID: ["", Validators.required],
            password: ["", Validators.required]
        });

        this.signInForms = this._formBuilder.group({
            loginID: ["", Validators.required],
            password: ["", Validators.required]
        });

        this.windowRef = this.win.windowRef;
    }

    ngOnInit(): void {
        this.windowRef = this.win.windowRef;
    }

    ngAfterViewInit() { }

    signUp(){
        this.clearSignUpScreen();
        this.isSignUp = !this.isSignUp;
    }

    clearLoginScreen(): void {
        var P = this;
        P.loginForms.get('loginID').setValue("");
        P.loginForms.get('password').setValue("");


        P.loginForms.get('loginID').markAsUntouched();
        P.loginForms.get('password').markAsUntouched();

        

        P.loginForms.markAsUntouched();
        P.loginForms.markAsPristine();
    }

    
    clearSignUpScreen(): void {
        var P = this;
        P.signInForms.get('loginID').setValue("");
        P.signInForms.get('password').setValue("");


        P.signInForms.get('loginID').markAsUntouched();
        P.signInForms.get('password').markAsUntouched();

        

        P.signInForms.markAsUntouched();
        P.signInForms.markAsPristine();
    }

    loginCheck() {
        var P = this;
        P.spinner.show();
        P.http.post(environment.nodeServerURL + "/user/login",
            {
                "loginID": P.loginForms.value.loginID,
                "password": P.loginForms.value.password,
            }).subscribe(res => {
                const result = res.json();
                localStorage.clear();
                if (result.statusCode == 200) {
                    let getUserData = result.data;
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("userID", getUserData[0]["_id"]);
                    localStorage.setItem("loginID", getUserData[0]["loginID"]);
                    P.route.navigate(['/apps/TestApp/announcement']);
                    P.spinner.hide();
                    P.cd.detectChanges();
                }
                else if (result.statusCode == 500) {
                    P.loginForms.controls['password'].setErrors({ 'InvalidUserNamePassword': true });
                    P.snackBar.open('Invalid Login ID or Password!', '', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                        panelClass: 'errorsnackbarclass'
                    });
                    P.spinner.hide();
                    P.cd.detectChanges();
                }
                else {
                    P.snackBar.open('Something entered gone wrong,please try again !', '', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                        panelClass: 'errorsnackbarclass'
                    });
                    P.spinner.hide();
                    P.cd.detectChanges();
                }
            }, error => {
                P.snackBar.open('Something entered gone wrong,please try again !', '', {
                    duration: 3000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                    panelClass: 'errorsnackbarclass'
                });
                P.spinner.hide();
                P.cd.detectChanges();
            });
        

    }

    createUser(){
        debugger;
        var P = this;
        P.spinner.show();
        P.submittedForm = P.signInForms.value;

            let bForm = P.submittedForm;
            P.loginService.addAnnounceDetail(bForm).then((result: any) => {
                if (result.statusCode == 200) {
                    P.spinner.hide();
                    P.snackBar.open('Added Successfully', '', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                        panelClass: 'successsnackbarclass'
                    });
                    P.isSignUp = false;
                    P.clearLoginScreen();
                    P.cd.detectChanges();
                }
                else if (result.statusCode == 422) {
                    P.signInForms.get('loginID').setErrors({ 'ExistingUser': true });
                    P.spinner.hide();
                    P.cd.detectChanges();
                }
                else {
                    P.snackBar.open('Something entered gone wrong,please try again!', '', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                        panelClass: 'errorsnackbarclass'
                    });
                    P.spinner.hide();
                    P.cd.detectChanges();
                }
            }).catch((error: any) => {
                P.snackBar.open('Something entered gone wrong,please try again!', '', {
                    duration: 3000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                    panelClass: 'errorsnackbarclass'
                });
                P.spinner.hide();
                P.cd.detectChanges();
            });
    }
​
}