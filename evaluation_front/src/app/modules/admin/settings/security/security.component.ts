import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { FuseAlertType } from '@fuse/components/alert';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'settings-security',
    templateUrl: './security.component.html',
})
export class SettingsSecurityComponent implements OnInit {
    securityForm: FormGroup;
    profilePicture;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    showAlert: boolean = false;
    /**
     * Constructor
     */
    constructor(
        private sanitizer: DomSanitizer,
        private _formBuilder: FormBuilder,
        private _userService: UserService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */

    ngOnInit(): void {
        // Create the form
        this.securityForm = this._formBuilder.group({
            currentPassword: ['', [Validators.required]],
            newPassword: [
                '',
                [
                    Validators.minLength(6),
                    Validators.required,
                    Validators.pattern(
                        '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$'
                    ),
                ],
            ],
            twoStep: [false],
            askPasswordChange: [false],
        });
    }

    updatePwd() {
        if (this.securityForm.dirty && this.securityForm.valid) {
            this._userService
                .updatePwd(this.securityForm.value)
                .subscribe((response) => {
                    if (response.id) {
                        this.alert = {
                            type: 'success',
                            message: 'profile updated with success',
                        };
                        this.showAlert = true;
                    } else {
                        this.alert = {
                            type: 'error',
                            message: 'check your current password',
                        };
                        this.showAlert = true;
                    }

                    setTimeout(() => {
                        this.showAlert = false;
                    }, 3000);
                });
        }
    }
}
