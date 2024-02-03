import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { UserService } from 'app/core/user/user.service';

@Injectable({
    providedIn: 'root',
})
export class AcademyService {
    // Private
    private _categories: BehaviorSubject<any[] | null> = new BehaviorSubject(
        null
    );
    private _course: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _courses: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    user;
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    ) {
        this._userService.user$.subscribe((data) => {
            this.user = data;
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for categories
     */
    get categories$(): Observable<any[]> {
        return this._categories.asObservable();
    }

    /**
     * Getter for courses
     */
    get courses$(): Observable<any[]> {
        return this._courses.asObservable();
    }

    /**
     * Getter for course
     */
    get course$(): Observable<any> {
        return this._course.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get categories
     */
    getCategories(): Observable<any[]> {
        return this._httpClient.get<any[]>('api/apps/academy/categories').pipe(
            tap((response: any) => {
                this._categories.next(response);
            })
        );
    }

    /**
     * Get courses
     */
    getCourses(): Observable<any[]> {
        return this._httpClient.get<any[]>('api/apps/academy/courses').pipe(
            tap((response: any) => {
                this._courses.next(response);
            })
        );
    }

    /**
     * Get course by id
     */
    getCourseById(id: string): Observable<any> {
        return this._httpClient
            .get<any>(
                environment.apiUrl +
                    'questions/questions-for-students/' +
                    this.user.student_class
            )
            .pipe(
                map((course) => {
                    // Update the course
                    this._course.next(course);

                    // Return the course
                    return course;
                }),
                switchMap((course) => {
                    if (!course) {
                        return throwError(
                            'Could not found course with id of ' + id + '!'
                        );
                    }

                    return of(course);
                })
            );
    }
}
