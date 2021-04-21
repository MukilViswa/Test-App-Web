import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectorRef, Inject } from '@angular/core';
import { FuseConfigService } from '@fuse/services/config.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { Http, Response, HttpModule } from '@angular/http';
import { navigation } from 'app/navigation/navigation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalService } from '@fuse/services/globals.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as english } from 'app/layout/components/toolbar//i18n/en';
import { locale as indonesian } from 'app/layout/components/toolbar//i18n/id';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';


@Component({
    selector: 'toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ToolbarComponent implements OnInit, OnDestroy {
    horizontalNavbar: boolean;
    rightNavbar: boolean;
    hiddenNavbar: boolean;
    languages: any;
    navigation: any;
    selectedLanguage: any;
    userStatusOptions: any[];
    name = "";
    orderEntryDatas: any = [];
    orderName:any = [];
    searchOrderName = "";
    userName = "";

    private _unsubscribeAll: Subject<any>;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _fuseSidebarService: FuseSidebarService,
        private _translateService: TranslateService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private route: Router,
        private http: Http,
        private dialog: MatDialog,
        private cd: ChangeDetectorRef,
        private spinner: NgxSpinnerService,
        public global: GlobalService,
        private snackBar: MatSnackBar,
    ) {
        this.name = localStorage.getItem("name");
        // Set the defaults
        this.userStatusOptions = [
            {
                title: 'Online',
                icon: 'icon-checkbox-marked-circle',
                color: '#4CAF50'
            },
            {
                title: 'Away',
                icon: 'icon-clock',
                color: '#FFC107'
            },
            {
                title: 'Do not Disturb',
                icon: 'icon-minus-circle',
                color: '#F44336'
            },
            {
                title: 'Invisible',
                icon: 'icon-checkbox-blank-circle-outline',
                color: '#BDBDBD'
            },
            {
                title: 'Offline',
                icon: 'icon-checkbox-blank-circle-outline',
                color: '#616161'
            }
        ];

        this.languages = [
            {
                id: 'en',
                title: 'English',
                flag: 'us'
            },
            {
                id: 'id',
                title: 'Bahasa',
                flag: 'id'
            },
        ];

        this._fuseTranslationLoaderService.loadTranslations(english, indonesian);

        this.navigation = navigation;

        this._unsubscribeAll = new Subject();
        this.userName = localStorage.getItem("loginID");
    }

    ngOnInit(): void {
        // Subscribe to the config changes
        this._fuseConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe((settings) => {
            this.horizontalNavbar = settings.layout.navbar.position === 'top';
            this.rightNavbar = settings.layout.navbar.position === 'right';
            this.hiddenNavbar = settings.layout.navbar.hidden === true;
        });
        // Set the selected language from default languages
        this.selectedLanguage = _.find(this.languages, { id: this._translateService.currentLang });
    }
    changePassword(): void {
        var P = this;
        const dialogRef = this.dialog.open(ChangePasswordPopup, {
            data: {}
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined && result != null && result != "") {
                this.spinner.show();
                localStorage.setItem("isLoggedIn", "false");
                localStorage.setItem("userID", "");
                localStorage.setItem("loginID", "");
                localStorage.setItem("employeeID", "");
                localStorage.setItem("employeeCode", "");
                localStorage.setItem("employeeName", "");
                localStorage.setItem("sessionID", "");
                localStorage.setItem("name", "");
                localStorage.setItem("role", "");
                localStorage.setItem("email", "");
                localStorage.setItem("profileImage", "");
                this.global.ngOnInit();
                this.route.navigate(['/apps']);
                this.spinner.hide();
                this.cd.detectChanges();
            }
        });
    }

    logOutUser() {
        var P = this;
        this.spinner.show();
        this.route.navigate(['/apps/login']);
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    toggleSidebarOpen(key): void {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    search(value): void {
        // Do your search here...
        console.log(value);
    }

    setLanguage(lang): void {
        // Set the selected language for the toolbar
        this.selectedLanguage = lang;

        // Use the selected language for translations
        this._translateService.use(lang.id);
    }
}

@Component({
    selector: 'changePassword',
    templateUrl: './changePassword.html',
})
export class ChangePasswordPopup {
    rpform: FormGroup;

    constructor(
        public matDialogRef: MatDialogRef<ChangePasswordPopup>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private _formBuilder: FormBuilder,
        private http: Http,
        private cd: ChangeDetectorRef,
        private snackBar: MatSnackBar,
        private spinner: NgxSpinnerService,
    ) {
        this.rpform = this._formBuilder.group({
            currentPassword: [{ value: "", disabled: false }, [Validators.required]],
            newPassword: [{ value: "", disabled: false }, [Validators.required, Validators.minLength(6)]],
            confirmNewPassword: [{ value: "", disabled: false }, [Validators.required, confirmPasswordValidator]],
        });
    }

    changePasswordConfirm(): void {
        var P = this;
        let cpForm = this.rpform.value;
        let userID = localStorage.getItem("userID");
        let sessionID = localStorage.getItem("sessionID");
        let getCreatedBy = localStorage.getItem("loginID");
        this.http.put(environment.nodeServerURL + "/user/changePassword", {
            _id: userID,
            sessionID: sessionID,
            oldPassword: cpForm.currentPassword,
            password: cpForm.newPassword,
            updatedBy: getCreatedBy,
        }).subscribe(res => {
            const result = res.json();
            if (result.statusCode == 200) {
                this.spinner.hide();
                this.matDialogRef.close("Password Changed");
                this.snackBar.open('Password Changed Successfully', '', {
                    duration: 3000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                    panelClass: 'successsnackbarclass'
                });
                this.cd.detectChanges();
            }
            else if (result.statusCode == 422) {
                this.rpform.get('currentPassword').setErrors({ 'InvalidPassword': true });
                this.spinner.hide();
                this.cd.detectChanges();
            }
            else {
                this.matDialogRef.close("");
                this.snackBar.open('Something entered gone wrong,please try again !', '', {
                    duration: 3000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                    panelClass: 'errorsnackbarclass'
                });
                this.spinner.hide();
                this.cd.detectChanges();
            }
        }, error => {
            this.matDialogRef.close("");
            this.snackBar.open('Something entered gone wrong,please try again !', '', {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: 'errorsnackbarclass'
            });
            this.spinner.hide();
            this.cd.detectChanges();
        });
    }
}

export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent || !control) {
        return null;
    }

    const password = control.parent.get('newPassword');
    const passwordConfirm = control.parent.get('confirmNewPassword');

    if (!password || !passwordConfirm) {
        return null;
    }

    if (passwordConfirm.value === '') {
        return null;
    }

    if (password.value === passwordConfirm.value) {
        return null;
    }

    return { passwordsNotMatching: true };
};
