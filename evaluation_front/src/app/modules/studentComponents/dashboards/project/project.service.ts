import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from 'app/core/user/user.service';

@Injectable({
    providedIn: 'root',
})
export class ProjectService {
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);
    private _teachers: BehaviorSubject<any> = new BehaviorSubject(null);
    private _framing: BehaviorSubject<any> = new BehaviorSubject(null);
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _ros: BehaviorSubject<any> = new BehaviorSubject(null);

    user;
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private sanitizer: DomSanitizer,
        private _userService: UserService
    ) {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                this.user = data;
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for data
     */
    get data$(): Observable<any> {
        return this._data.asObservable();
    }
    get teachers$(): Observable<any> {
        return this._teachers.asObservable();
    }
    get ros$(): Observable<any> {
        return this._ros.asObservable();
    }
    get framing$(): Observable<any> {
        return this._framing.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getData(): Observable<any> {
        return this._httpClient.get('api/dashboards/project').pipe(
            tap((response: any) => {
                this._data.next(response);
            })
        );
    }
    rateTeacher(rate: any) {
        return this._httpClient.post<any>(environment.apiUrl + 'ratting', rate);
    }
    rateRo(rate: any) {
        return this._httpClient.post<any>(environment.apiUrl + 'ratting/ro', rate);
    }
    rateFramer(rate: any) {
        return this._httpClient.post<any>(
            environment.apiUrl + 'ratting/framing',
            rate
        );
    }
    getRos(): Observable<any> {
        return this._httpClient.get(environment.apiUrl + 'mtc/ro-student').pipe(
            tap((response: any) => {
                response.forEach((teacher: any) => {
                    this.downloadMediaFromUser(teacher.image).subscribe(
                        (blob: any) => {
                            let objectURL = URL.createObjectURL(blob);
                            teacher.blobImage =
                                this.sanitizer.bypassSecurityTrustUrl(
                                    objectURL
                                );
                        },
                        (error) => {
                            console.log(error);
                        }
                    );
                });

                this._ros.next(response);
            })
        );
    }
    getTeachers(): Observable<any> {
        return this._httpClient.get(environment.apiUrl + 'mtc/stc-all').pipe(
            tap((response: any) => {
                response.forEach((teacher: any) => {
                    this.downloadMediaFromUser(teacher.image).subscribe(
                        (blob: any) => {
                            let objectURL = URL.createObjectURL(blob);
                            teacher.blobImage =
                                this.sanitizer.bypassSecurityTrustUrl(
                                    objectURL
                                );
                        },
                        (error) => {
                            console.log(error);
                        }
                    );
                });

                this._teachers.next(response);
            })
        );
    }
    getFraming(): Observable<any> {
        return this._httpClient.get(environment.apiUrl + 'mtc/framing').pipe(
            tap((response: any) => {
                response.forEach((teacher: any) => {
                    this.downloadMediaFromUser(teacher.image).subscribe(
                        (blob: any) => {
                            let objectURL = URL.createObjectURL(blob);
                            teacher.blobImage =
                                this.sanitizer.bypassSecurityTrustUrl(
                                    objectURL
                                );
                        },
                        (error) => {
                            console.log(error);
                        }
                    );
                });

                this._framing.next(response);
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
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
