import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from 'app/core/user/user.types';
import { environment } from 'environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private _user: BehaviorSubject<User> = new BehaviorSubject<User>(null);

    /**
     * Constructor
     */
    constructor(
        private sanitizer: DomSanitizer,
        private _httpClient: HttpClient
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<any> {
        return this._httpClient
            .get<any>(environment.apiUrl + 'auth/current-user')
            .pipe(
                map((user) => {
                    let data = {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        address: user.address,
                        image: user.image,
                        blobImage: null,
                        about: user.about,
                        role: user.role,
                        rdi: user.rdi,
                        student_class: user.student_class,
                        phone: user.phone,
                        framing: user.framing,
                        email_verified: user.email_verified,
                        class_name: user.name_class,
                        social_image: user.social_image,
                        reclamation: user.reclamation,
                    };

                    return data;
                }),
                map(async (data) => {
                    try {
                        const res = await this.downloadMediaFromUser(
                            data.image
                        ).toPromise();
                        const objectURL = URL.createObjectURL(res);
                        data.blobImage =
                            this.sanitizer.bypassSecurityTrustUrl(objectURL);
                        this._user.next(data);

                        return data;
                    } catch (err) {
                        return null;
                    }
                })
            );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: any): Observable<any> {
        return this._httpClient
            .patch<any>(environment.apiUrl + 'user', user)
            .pipe(
                map((user) => {
                    let data = {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        address: user.address,
                        image: user.image,
                        rdi: user.rdi,
                        blobImage: null,
                        about: user.about,
                        role: user.role,
                        framing: user.framing,
                        student_class: user.student_class,
                        phone: user.phone,
                        class_name: user.name_class,
                        social_image: user.social_image,
                        reclamation: user.reclamation,
                    };
                    this.downloadMediaFromUser(data.image).subscribe((res) => {
                        const objectURL = URL.createObjectURL(res);
                        data.blobImage =
                            this.sanitizer.bypassSecurityTrustUrl(objectURL);
                        this._user.next(data);
                    });
                })
            );
    }

    uploadMedia(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('image', file);
        return this._httpClient
            .patch<any>(environment.apiUrl + 'user/profile-picture', formData)
            .pipe(
                map((user) => {
                    let data = {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        address: user.address,
                        image: user.image,
                        rdi: user.rdi,
                        blobImage: null,
                        about: user.about,
                        role: user.role,
                        framing: user.framing,
                        student_class: user.student_class,
                        phone: user.phone,
                        class_name: user.name_class,
                        social_image: user.social_image,
                        reclamation: user.reclamation,
                    };
                    this.downloadMediaFromUser(data.image).subscribe((res) => {
                        const objectURL = URL.createObjectURL(res);
                        data.blobImage =
                            this.sanitizer.bypassSecurityTrustUrl(objectURL);
                        this._user.next(data);
                    });
                })
            );
    }

    downloadMediaFromUser(fileName: any): Observable<Blob> {
        return this._httpClient.get(
            environment.apiUrl + 'user/profile-picture/' + fileName,
            {
                responseType: 'blob',
            }
        );
    }
    /**
     * Update Pwd
     *
     * @param user
     */
    updatePwd(user: any): Observable<any> {
        return this._httpClient
            .patch<any>(environment.apiUrl + 'user/user-pwd', user)
            .pipe(
                map((response) => {
                    return response;
                })
            );
    }
}
