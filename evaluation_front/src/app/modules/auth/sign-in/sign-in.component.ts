import {
    Component,
    Inject,
    NgZone,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';

import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { CredentialResponse, PromptMomentNotification } from 'google-one-tap';
import {
    MsalService,
    MsalBroadcastService,
    MSAL_GUARD_CONFIG,
    MsalGuardConfiguration,
} from '@azure/msal-angular';
import { Subject } from 'rxjs';
import {
    AuthenticationResult,
    EventMessage,
    EventType,
    InteractionStatus,
    PopupRequest,
    RedirectRequest,
} from '@azure/msal-browser';
import { filter, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class AuthSignInComponent implements OnInit {
    title = 'Angular 13 RxJS 6 - Angular v2 Sample';
    isIframe = false;
    loginDisplay = false;
    private readonly _destroying$ = new Subject<void>();
    photoUrl;
    isLoggedin?: boolean;
    private clientId = environment.clientId;

    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: FormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        @Inject(MSAL_GUARD_CONFIG)
        private msalGuardConfig: MsalGuardConfiguration,
        private authService: MsalService,
        private msalBroadcastService: MsalBroadcastService,
        private http: HttpClient,
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _ngZone: NgZone,
        private _userService: UserService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    async handleCredentialResponse(response: CredentialResponse) {
        await this._authService.LoginWithGoogle(response.credential).subscribe(
            (x: any) => {
                this._ngZone.run(() => {
                    const redirectURL =
                        this._activatedRoute.snapshot.queryParamMap.get(
                            'redirectURL'
                        ) || '/signed-in-redirect';

                    // Navigate to the redirect url
                    this._router.navigateByUrl(redirectURL);
                });
            },
            (error: any) => {
                console.log(error);
            }
        );
    }

    getProfile() {
        this._authService.uploadPicture().subscribe(
            (data: any) => {
                this._authService
                    .uploadMedia(this.blobToFile(data, 'msalPicture'))
                    .subscribe(async (res) => {
                        this._authService.profilePicture = res;
                        await this.http
                            .get(GRAPH_ENDPOINT)
                            .subscribe((profile) => {
                                this._authService
                                    .LoginWithMsal(profile)
                                    .subscribe(
                                        (x: any) => {
                                            this._ngZone.run(() => {
                                                const redirectURL =
                                                    this._activatedRoute.snapshot.queryParamMap.get(
                                                        'redirectURL'
                                                    ) || '/signed-in-redirect';

                                                // Navigate to the redirect url
                                                this._router.onSameUrlNavigation =
                                                    'reload';

                                                this._router.navigateByUrl(
                                                    redirectURL
                                                );
                                            });
                                        },
                                        (error: any) => {
                                            this.alert = {
                                                type: 'error',
                                                message: 'Wrong email',
                                            };

                                            // Show the alert
                                            this.showAlert = true;
                                        }
                                    );
                            });
                    });
            },
            (error) => {
                console.log(error);
            }
        );
    }
    /**
     * On init
     */
    ngOnInit(): void {
        // @ts-ignore
        // google.accounts.id.initialize({
        //     client_id: this.clientId,
        //     callback: this.handleCredentialResponse.bind(this),
        //     auto_select: false,
        //     cancel_on_tap_outside: false,
        // });
        // // @ts-ignore
        // google.accounts.id.renderButton(
        //     // @ts-ignore
        //     document.getElementById('buttonDiv'),
        //     { theme: 'outline', size: 'large', width: '100%' }
        // );
        // // @ts-ignore
        // google.accounts.id.prompt(
        //     (notification: PromptMomentNotification) => {}
        // );

        // this.isIframe = window !== window.parent && !window.opener; // Remove this line to use Angular Universal

        this.signInForm = this._formBuilder.group({
            email: [
                '',
                [
                    Validators.required,
                    Validators.email,
                    Validators.pattern('^.+@esprit.tn$'),
                ],
            ],
            password: ['', Validators.required],
            rememberMe: [''],
        });
    }

    setLoginDisplay() {
        this.loginDisplay =
            this.authService.instance.getAllAccounts().length > 0;
    }

    checkAndSetActiveAccount() {
        /**
         * If no active account set but there are accounts signed in, sets first account to active account
         * To use active account set here, subscribe to inProgress$ first in your component
         * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
         */
        let activeAccount = this.authService.instance.getActiveAccount();

        if (
            !activeAccount &&
            this.authService.instance.getAllAccounts().length > 0
        ) {
            let accounts = this.authService.instance.getAllAccounts();
            this.authService.instance.setActiveAccount(accounts[0]);
        }
    }

    loginRedirect() {
        if (this.msalGuardConfig.authRequest) {
            this.authService.loginRedirect({
                ...this.msalGuardConfig.authRequest,
            } as RedirectRequest);
        } else {
            this.authService.loginRedirect();
        }
    }
 

    loginPopup() {
        this.showAlert = false;

        if (this.msalGuardConfig.authRequest) {
            this.authService
                .loginPopup({
                    ...this.msalGuardConfig.authRequest,
                } as PopupRequest)
                .subscribe((response: AuthenticationResult) => {
                    this.authService.instance.setActiveAccount(
                        response.account
                    );
                    this.getProfile();
                });
        } else {
            this.authService
                .loginPopup()
                .subscribe((response: AuthenticationResult) => {
                    this.authService.instance.setActiveAccount(
                        response.account
                    );
                    this.getProfile();
                });
        }
    }

    logout(popup?: boolean) {
        if (popup) {
            this.authService.logoutPopup({
                mainWindowRedirectUri: '/',
            });
        } else {
            this.authService.logoutRedirect();
        }
    }

    ngOnDestroy(): void {
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }

    public blobToFile = (theBlob: Blob, fileName: string): File => {
        var b: any = theBlob;
        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        b.lastModifiedDate = new Date();
        b.name = fileName;

        //Cast to a File() type
        return <File>theBlob;
    };

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            this.alert = {
                type: 'error',
                message: 'Wrong email or password',
            };

            // Show the alert
            this.showAlert = true;
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value).subscribe(
            () => {
                // Set the redirect url.
                // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                // to the correct page after a successful sign in. This way, that url can be set via
                // routing file and we don't have to touch here.
                const redirectURL =
                    this._activatedRoute.snapshot.queryParamMap.get(
                        'redirectURL'
                    ) || '/signed-in-redirect';

                // Navigate to the redirect url
                this._router.navigateByUrl(redirectURL);
            },
            (response) => {
                // Re-enable the form
                this.signInForm.enable();

                // Reset the form
                this.signInNgForm.resetForm();

                // Set the alert
                this.alert = {
                    type: 'error',
                    message: 'Wrong email or password',
                };

                // Show the alert
                this.showAlert = true;
            }
        );
    }
}
