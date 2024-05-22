import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from './../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { SolanaServicesService } from 'app/modules/admin/solana-services/solana-services.service';
import { user } from './../../mock-api/common/user/data';
import { Router } from '@angular/router';
const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me/photo/$value';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private _user: any = null;
    // private _solanaService: SolanaServicesService;

    /**
     * Constructor
     */
    constructor(
        private sanitizer: DomSanitizer,
        private _httpClient: HttpClient,
        private _userService: UserService
    ) {
        _userService.user$.subscribe((user) => {
            this._user = user;
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }
    downloadMedia(fileName: any): Observable<Blob> {
        return this._httpClient.get(
            environment.apiUrl + 'auth/profile-picture/' + fileName,
            {
                responseType: 'blob',
            }
        );
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signInSocial(socialCred: any): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._user) {
            return throwError('User is already logged in.');
        }

        return this._httpClient
            .post(environment.apiUrl + 'auth/social-sign-in', socialCred, {
                observe: 'response',
                withCredentials: true,
            })
            .pipe(
                switchMap((response: any) => {
                    this._userService.user = response.user;

                    // Store the access token in the local storage
                    this.accessToken = response.body.accessToken;
                    // Set the authenticated flag to true

                    // Store the user on the user service

                    // Return a new observable with the response
                    return of(response);
                })
            );
    }

    public blobToFile = (theBlob: Blob, fileName: string): File => {
        var b: any = theBlob;
        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        b.lastModifiedDate = new Date();
        b.name = fileName;

        //Cast to a File() type
        return <File>b;
    };

    uploadMedia(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('image', file);
        return this._httpClient.post<any>(
            environment.apiUrl + 'auth/msalPicture',
            formData
        );
    }
    profilePicture;
    uploadPicture(): Observable<any> {
        return this._httpClient.get(GRAPH_ENDPOINT, { responseType: 'blob' });
    }

    LoginWithMsal(credentials: any): Observable<any> {
        if (this._user) {
            return throwError('User is already logged in.');
        }
        let credentialsData = {
            mail: credentials.mail,
        };

        if (this.profilePicture) {
            credentialsData['image'] = this.profilePicture;
            console.log(credentialsData);
        }
        return this._httpClient
            .post(environment.apiUrl + 'auth/msal', { credentialsData })
            .pipe(
                switchMap((response: any) => {
                    let data = {
                        id: response.user.id,
                        first_name: response.user.first_name,
                        last_name: response.user.last_name,
                        email: response.user.email,
                        address: response.user.address,
                        image: response.user.image,
                        blobImage: null,
                        about: response.user.about,
                        role: response.user.role,
                        classroom: response.user.classroom_id,
                        phone: response.user.phone,
                        rdi: response.user.rdi,
                        class_name: response.user.name_class,
                        social_image: response.user.social_image,
                        reclamation: response.user.reclamation,
                        department: response.user.department,

                    };

                    // Store the access token in the local storage
                    // Set the authenticated flag to true
                    this.accessToken = response.accessToken;

                    // Store the user on the user service

                    // Return a new observable with the response

                    return this.downloadMedia(this.profilePicture).pipe(
                        map(
                            (res) => {
                                const objectURL = URL.createObjectURL(res);
                                data.blobImage =
                                    this.sanitizer.bypassSecurityTrustUrl(
                                        objectURL
                                    );
                                this._userService.user = data;

                                return of(true);
                            },
                            (err) => {
                                return of(false);
                            }
                        )
                    );
                })
            );
    }
    LoginWithGoogle(credentials: string): Observable<any> {
        if (this._user) {
            return throwError('User is already logged in.');
        }
        let credentialsData = credentials;
        return this._httpClient
            .post(environment.apiUrl + 'auth/social-sign-in', {
                credentialsData,
            })
            .pipe(
                switchMap((response: any) => {
                    let data = {
                        id: response.user.id,
                        first_name: response.user.first_name,
                        last_name: response.user.last_name,
                        email: response.user.email,
                        address: response.user.address,
                        image: response.user.image,
                        blobImage: null,
                        about: response.user.about,
                        role: response.user.role,
                        rdi: response.user.rdi,
                        classroom: response.user.classroom_id,
                        phone: response.user.phone,
                        class_name: response.user.name_class,
                        social_image: response.user.social_image,
                        reclamation: response.user.reclamation,
                        department: response.user.department,

                    };

                    // Store the access token in the local storage
                    this.accessToken = response.accessToken;
                    // Set the authenticated flag to true

                    // Store the user on the user service

                    // Return a new observable with the response

                    return this.downloadMedia(data.image).pipe(
                        map(
                            (res) => {
                                const objectURL = URL.createObjectURL(res);
                                data.blobImage =
                                    this.sanitizer.bypassSecurityTrustUrl(
                                        objectURL
                                    );
                                this._userService.user = data;

                                return of(true);
                            },
                            (err) => {
                                return of(false);
                            }
                        )
                    );
                })
            );
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._user) {
            return throwError('User is already logged in.');
        }

        return this._httpClient
            .post(environment.apiUrl + 'auth/sign-in', credentials, {
                observe: 'response',
                withCredentials: true,
            })
            .pipe(
                switchMap((response: any) => {
                    let data = {
                        id: response.body.user.id,
                        first_name: response.body.user.first_name,
                        last_name: response.body.user.last_name,
                        email: response.body.user.email,
                        address: response.body.user.address,
                        image: response.body.user.image,
                        blobImage: null,
                        rdi: response.body.user.rdi,
                        about: response.body.user.about,
                        role: response.body.user.role,
                        classroom: response.body.user.classroom_id,
                        phone: response.body.user.phone,
                        class_name: response.body.user.name_class,
                        social_image: response.body.user.social_image,
                        reclamation: response.body.user.reclamation,
                        department: response.body.user.department,

                    };

                    // Store the access token in the local storage
                    this.accessToken = response.body.accessToken;
                    // Set the authenticated flag to true

                    // Store the user on the user service

                    // Return a new observable with the response

                    return this.downloadMedia(data.image).pipe(
                        map(
                            (res) => {
                                const objectURL = URL.createObjectURL(res);
                                data.blobImage =
                                    this.sanitizer.bypassSecurityTrustUrl(
                                        objectURL
                                    );
                                this._userService.user = data;

                                return of(true);
                            },
                            (err) => {
                                return of(false);
                            }
                        )
                    );
                })
            );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Renew token
        return this._httpClient
            .get(environment.apiUrl + 'auth/refresh-access-token', {
                withCredentials: true,
            })
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {
                    let data = {
                        id: response.user.id,
                        first_name: response.user.first_name,
                        last_name: response.user.last_name,
                        email: response.user.email,
                        address: response.user.ddress,
                        image: response.user.image,
                        blobImage: null,
                        rdi: response.user.rdi,
                        about: response.user.about,
                        role: response.user.role,
                        classroom: response.user.classroom_id,
                        phone: response.user.phone,
                        class_name: response.user.name_class,
                        social_image: response.user.social_image,
                        reclamation: response.user.reclamation,
                        department: response.user.department,
                    };
                    // Store the access token in the local storage
                    this.accessToken = response.accessToken;

                    // Set the authenticated flag to true

                    // Store the user on the user service
                    return this.downloadMedia(data.image).pipe(
                        map(
                            (res) => {
                                const objectURL = URL.createObjectURL(res);
                                data.blobImage =
                                    this.sanitizer.bypassSecurityTrustUrl(
                                        objectURL
                                    );
                                this._userService.user = data;

                                return of(true);
                            },
                            (err) => {
                                return of(false);
                            }
                        )
                    );
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        return this._httpClient
            .delete(environment.apiUrl + 'auth/logout', {
                withCredentials: true,
            })
            .pipe(
                switchMap(async (response: any) => {
                    this._userService.user = null;

                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('publicKeywallet');
                    // Return the observable
                    window.sessionStorage.clear();
                    localStorage.clear();

                    return of(true);
                })
            );
        // Set the authenticated flag to false
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    isAuthanticated(): Observable<boolean> {
        // Check if the user is logged in
        return of(this._user);
    }

    isAdmin() {
        return of(this._user && this._user.role == 'ADMIN');
    }

    isResponsable() {
        return of(
            this._user &&
                (this._user.role == 'TEACHER' ||
                    this._user.role == 'CUP' ||
                    this._user.role == 'RDI' ||
                    this._user.role == 'RO' ||
                    this._user.role == 'CD')
        );
    }

    isAdminOrResponsable() {
        return of(
            this._user &&
                (this._user.role == 'ADMIN' ||
                    this._user.role == 'TEACHER' ||
                    this._user.role == 'CUP' ||
                    this._user.role == 'RDI' ||
                    this._user.role == 'RO' ||
                    this._user.role == 'CD')
        );
    }

    isStudent() {
        return of(this._user && this._user.role == 'STUDENT');
    }
}
