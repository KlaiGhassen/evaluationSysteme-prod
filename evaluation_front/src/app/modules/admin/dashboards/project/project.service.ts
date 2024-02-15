import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ProjectService {
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);
    private _studentsNumber: BehaviorSubject<any> = new BehaviorSubject(null);
    private _chartStudents: BehaviorSubject<any> = new BehaviorSubject(null);

    private _dataFraming: BehaviorSubject<any> = new BehaviorSubject(null);
    private _affectationTeachers: BehaviorSubject<any> = new BehaviorSubject(
        null
    );
    private _NotRdi: BehaviorSubject<any> = new BehaviorSubject(null);

    private _dataTeaching: BehaviorSubject<any> = new BehaviorSubject(null);
    private _teachers: BehaviorSubject<any> = new BehaviorSubject(null);
    user;
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private sanitizer: DomSanitizer,
        private _userService: UserService
    ) {
        this._userService.user$.subscribe((user) => {
            this.user = user;
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
    get dataTeaching$(): Observable<any> {
        return this._dataTeaching.asObservable();
    }
    get dataFraming$(): Observable<any> {
        return this._dataFraming.asObservable();
    }
    get studentsNumber$(): Observable<any> {
        return this._studentsNumber.asObservable();
    }
    get chartStudents$(): Observable<any> {
        return this._chartStudents.asObservable();
    }

    get affectationTeachers$(): Observable<any> {
        return this._affectationTeachers.asObservable();
    }
    get notRdi$(): Observable<any> {
        return this._NotRdi.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getTeacherRatings(): Observable<any> {
        return this._httpClient
            .get(environment.apiUrl + 'dashboard/ratedChart')
            .pipe(
                tap((response: any) => {
                    this._chartStudents.next(response);
                })
            );
    }
    getStudentChart(): Observable<any> {
        return this._httpClient
            .get(environment.apiUrl + 'dashboard/ratedChart')
            .pipe(
                tap((response: any) => {
                    this._chartStudents.next(response);
                })
            );
    }
    getStudentNumbersChart(): Observable<any> {
        return this._httpClient
            .get(environment.apiUrl + 'dashboard/studentNumber')
            .pipe(
                tap((response: any) => {
                    this._studentsNumber.next(response);
                })
            );
    }

    getDatFraming(): Observable<any> {
        return this._httpClient
            .get(environment.apiUrl + 'dashboard/allframing')
            .pipe(
                tap((response: any) => {
                    this._dataFraming.next(response);
                })
            );
    }
    getStudentNumber(): Observable<any> {
        return this._httpClient
            .get(environment.apiUrl + 'dashboard/allframing')
            .pipe(
                tap((response: any) => {
                    this._dataFraming.next(response);
                })
            );
    }

    getTeachingData(): Observable<any> {
        return this._httpClient
            .get(environment.apiUrl + 'dashboard/allByClassRooms')
            .pipe(
                tap((response: any) => {
                    this._dataTeaching.next(response);
                })
            );
    }
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

    getTeachersNotRdi(): Observable<any> {
        return this._httpClient
            .get(environment.apiUrl + 'teacher/not-rdi')
            .pipe(
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

                    this._NotRdi.next(response);
                })
            );
    }

    getTeachers(): Observable<any> {
        return this._httpClient
            .get(environment.apiUrl + 'teacher/same-team')
            .pipe(
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
    getAffectetionTeachers(): Observable<any> {
        return this._httpClient
            .get(environment.apiUrl + 'teacher/rdi-team')
            .pipe(
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

                    this._affectationTeachers.next(response);
                })
            );
    }

    reclaim(): Observable<any> {
        return this._httpClient.patch<any>(
            environment.apiUrl + 'user/reclaim',
            { reclaim: 'reclaim' }
        );
    }
    deleteToRdi(id: any): Observable<any> {
        return this.affectationTeachers$.pipe(
            take(1),
            switchMap((course) =>
                this._httpClient
                    .put<any>(environment.apiUrl + 'teacher/rdi-delete', {
                        id,
                    })
                    .pipe(
                        map((newCourses) => {
                            const index = course.findIndex(
                                (item) => item.id === id
                            );

                            // Delete the task
                            course.splice(index, 1);

                            // Update the tasks
                            this._affectationTeachers.next(course);

                            // Return the deleted status
                            return newCourses;
                        })
                    )
            )
        );
    }

    addToRdi(id: any): Observable<any> {
        return this.affectationTeachers$.pipe(
            take(1),
            switchMap((course) =>
                this._httpClient
                    .put<any>(environment.apiUrl + 'teacher/rdi-add', {
                        id,
                    })
                    .pipe(
                        map((newCourses) => {
                            this.downloadMediaFromUser(
                                newCourses.image
                            ).subscribe(
                                (blob: any) => {
                                    let objectURL = URL.createObjectURL(blob);
                                    newCourses.blobImage =
                                        this.sanitizer.bypassSecurityTrustUrl(
                                            objectURL
                                        );
                                    this._affectationTeachers.next([
                                        newCourses,
                                        ...course,
                                    ]);
                                },
                                (error) => {
                                    console.log(error);
                                }
                            );

                            return newCourses;
                        })
                    )
            )
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
    rateTeacher(rate: any) {
        return this._httpClient.post<any>(
            environment.apiUrl + 'ratting/teacher',
            rate
        );
    }
}
