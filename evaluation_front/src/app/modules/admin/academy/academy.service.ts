import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import {
    Classroom,
    Module,
    CoursesUeClassroom,
    ClassroomUes,
    UeModules,
} from 'app/modules/admin/academy/academy.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AcademyService {
    // Private
    private _coursesUeClassroom: BehaviorSubject<any[] | null> =
        new BehaviorSubject(null);
    private _categories: BehaviorSubject<any[] | null> = new BehaviorSubject(
        null
    );
    private _course: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _courses: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _ros: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    get tags$(): Observable<any[]> {
        return this._tags.asObservable();
    }
    getTags(): Observable<any[]> {
        return this._httpClient
            .get<any[]>(environment.apiUrl + 'class-rooms')
            .pipe(
                tap((response: any) => {
                    this._tags.next(response);
                })
            );
    }

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

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
     * Getter for courses
     */
    get ro$(): Observable<any[]> {
        return this._ros.asObservable();
    }

    /**
     * Getter for course
     */
    get course$(): Observable<any> {
        return this._course.asObservable();
    }

    /**
     * Getter for course join
     */
    get coursesUeClassroom$(): Observable<any[]> {
        return this._coursesUeClassroom.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get categories
     */

    getRo(): Observable<Classroom[]> {
        return this._httpClient
            .get<Classroom[]>(environment.apiUrl + 'teacher/ro')
            .pipe(
                tap((response: any) => {
                    this._ros.next(response);
                })
            );
    }

    getCategories(): Observable<Classroom[]> {
        return this._httpClient
            .get<Classroom[]>(environment.apiUrl + 'ue/all-class')
            .pipe(
                tap((response: any) => {
                    this._categories.next(response);
                })
            );
    }
    getCoursesUeClassroom(): Observable<UeModules[]> {
        return this._httpClient
            .get<CoursesUeClassroom[]>(environment.apiUrl + 'ue/all-cum')
            .pipe(
                map((response: CoursesUeClassroom[]) => {
                    const UeList = response.filter(
                        (obj, index, arr) =>
                            index ===
                            arr.findIndex(
                                (o) => JSON.stringify(o) === JSON.stringify(obj)
                            )
                    );

                    return UeList;
                }),
                tap((response: any) => {
                    console.log('response', response);
                    this._coursesUeClassroom.next(response);
                })
            );
    }
    /**
     * Get courses
     */
    launchRate(classRooms): Observable<any> {
        return this.coursesUeClassroom$.pipe(
            take(1),
            switchMap((course) =>
                this._httpClient
                    .patch<any>(
                        environment.apiUrl + 'class-rooms/launchRate',
                        classRooms
                    )
                    .pipe(
                        map((response: any[]) => {
                            const UeList = response.filter(
                                (obj, index, arr) =>
                                    index ===
                                    arr.findIndex(
                                        (o) =>
                                            JSON.stringify(o) ===
                                            JSON.stringify(obj)
                                    )
                            );

                            return UeList;
                        }),
                        tap((response: any) => {
                            this._coursesUeClassroom.next(response);
                        })
                    )
            )
        );
    }

    /**
     * Get courses
     */
    getCourses(): Observable<any[]> {
        return this._httpClient
            .get<any[]>(environment.apiUrl + 'ue/all-ue')
            .pipe(
                tap((response: any) => {
                    this._courses.next(response);
                })
            );
    }
    createCourse(classroom: any): Observable<any> {
        return this.coursesUeClassroom$.pipe(
            take(1),
            switchMap((course) =>
                this._httpClient
                    .post<any>(environment.apiUrl + 'ue/addOne', classroom)
                    .pipe(
                        map((newCourses) => {
                            this._coursesUeClassroom.next(newCourses);
                            return newCourses;
                        })
                    )
            )
        );
    }
    createUe(classroom: any): Observable<any> {
        return this.courses$.pipe(
            take(1),
            switchMap((course) =>
                this._httpClient
                    .post<any>(environment.apiUrl + 'ue/addOneUe', classroom)
                    .pipe(
                        map((newCourse) => {
                            this._courses.next([newCourse, ...course]);
                            return newCourse;
                        })
                    )
            )
        );
    }

    /**
     * Get course by id
     */
    getCourseById(id: string): Observable<Module> {
        return this._httpClient
            .get<Module>(environment.apiUrl + 'ue/by-id', { params: { id } })
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
