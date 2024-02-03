import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root',
})
export class ContactsService {
    // Private
    private _contact: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _contacts: BehaviorSubject<any[] | null> = new BehaviorSubject(
        null
    );
    private _teacherRate: BehaviorSubject<any[] | null> = new BehaviorSubject(
        null
    );
    private _classRooms: BehaviorSubject<any[] | null> = new BehaviorSubject(
        null
    );
    private _up: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _modules: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _allJoin: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _chartStudents: BehaviorSubject<any> = new BehaviorSubject(null);
    private _students: BehaviorSubject<any[] | null> = new BehaviorSubject(
        null
    );
    private _dataFraming: BehaviorSubject<any[] | null> = new BehaviorSubject(
        null
    );

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private sanitizer: DomSanitizer
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for contact
     */
    get ups$(): Observable<any> {
        return this._up.asObservable();
    }
    get contact$(): Observable<any> {
        return this._contact.asObservable();
    }
    get TeacherRate$(): Observable<any[]> {
        return this._teacherRate.asObservable();
    }

    /**
     * Getter for contacts
     */
    get contacts$(): Observable<any[]> {
        return this._contacts.asObservable();
    }
    /**
     * Getter for contacts
     */
    get modules$(): Observable<any[]> {
        return this._modules.asObservable();
    }
    /**
     * Getter for contacts
     */
    get classRooms$(): Observable<any[]> {
        return this._classRooms.asObservable();
    }
    get students$(): Observable<any[]> {
        return this._students.asObservable();
    }
    /**
     * Getter for contacts
     */
    get allJoin$(): Observable<any[]> {
        return this._allJoin.asObservable();
    }
    get chartStudents$(): Observable<any> {
        return this._chartStudents.asObservable();
    }
    get framingStudents$(): Observable<any> {
        return this._dataFraming.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get contacts
     */
    /**
     * Get labels
     */
    getUps(): Observable<any[]> {
        return this._httpClient.get<any[]>(environment.apiUrl + 'up').pipe(
            tap((response: any[]) => {
                this._up.next(response);
            })
        );
    }
    getModules(): Observable<any[]> {
        return this._httpClient
            .get<any[]>(environment.apiUrl + 'ue/all-modules')
            .pipe(
                tap((contacts) => {
                    this._modules.next(contacts);
                })
            );
    }
    getStudentChart(id): Observable<any> {
        return this._httpClient
            .get(environment.apiUrl + 'dashboard/ratedChartUser/' + id)
            .pipe(
                tap((response: any) => {
                    this._chartStudents.next(response);
                })
            );
    }
    affectationSuperVisor(framingId, idStudent): Observable<any> {
        return this._httpClient.put(
            environment.apiUrl + 'students/affectationFraming',
            { studentId: idStudent, framingId: framingId }
        );
    }
    getStudent(id): Observable<any> {
        return this._httpClient
            .get(environment.apiUrl + 'user/students/' + id)
            .pipe(
                tap((response: any) => {
                    this._students.next(response);
                })
            );
    }

    getTeacherRated(id): Observable<any> {
        return this._httpClient
            .get(environment.apiUrl + 'dashboard/teachersRate/' + id)
            .pipe(
                tap((response: any) => {
                    this._teacherRate.next(response);
                })
            );
    }
    getDatFraming(id): Observable<any> {
        return this._httpClient
            .get(environment.apiUrl + 'dashboard/framingById/' + id)
            .pipe(
                tap((response: any) => {
                    this._dataFraming.next(response);
                })
            );
    }

    /**
     * Get contacts
     */
    getClassRooms(): Observable<any[]> {
        return this._httpClient
            .get<any[]>(environment.apiUrl + 'class-rooms')
            .pipe(
                tap((contacts) => {
                    this._classRooms.next(contacts);
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
     * Get contacts
     */
    getContacts(renking, up): Observable<any[]> {
        return this._httpClient
            .get<any[]>(environment.apiUrl + 'teacher/all', {
                params: {
                    sort: renking,
                    up: up,
                },
            })
            .pipe(
                tap((contacts) => {
                    console.log(contacts);
                    contacts.forEach((teacher: any) => {
                        if (teacher.social_image) {
                            this.downloadMediaFromUser(
                                teacher.social_image
                            ).subscribe(
                                (blob: any) => {
                                    let objectURL = URL.createObjectURL(blob);
                                    teacher['blobImage'] =
                                        this.sanitizer.bypassSecurityTrustUrl(
                                            objectURL
                                        );
                                },
                                (error) => {
                                    console.log(error);
                                }
                            );
                        }
                    });
                    this._contacts.next(contacts);
                })
            );
    }

    /**
     * Search contacts with given query
     *
     * @param query
     */
    searchContacts(query: string): Observable<any[]> {
        if (query) {
            return this._httpClient
                .get<any[]>(environment.apiUrl + 'teacher/search', {
                    params: { query },
                })
                .pipe(
                    tap((contacts) => {
                        contacts.forEach((teacher: any) => {
                            if (teacher.social_image) {
                                this.downloadMediaFromUser(
                                    teacher.image
                                ).subscribe(
                                    (blob: any) => {
                                        let objectURL =
                                            URL.createObjectURL(blob);
                                        teacher['blobImage'] =
                                            this.sanitizer.bypassSecurityTrustUrl(
                                                objectURL
                                            );
                                    },
                                    (error) => {
                                        console.log(error);
                                    }
                                );
                            }
                        });

                        this._contacts.next(contacts);
                    })
                );
        } else {
            return this._httpClient
                .get<any[]>(environment.apiUrl + 'teacher/all')
                .pipe(
                    tap((contacts) => {
                        contacts.forEach((teacher: any) => {
                            if (teacher.social_image) {
                                this.downloadMediaFromUser(
                                    teacher.social_image
                                ).subscribe(
                                    (blob: any) => {
                                        let objectURL =
                                            URL.createObjectURL(blob);
                                        teacher['blobImage'] =
                                            this.sanitizer.bypassSecurityTrustUrl(
                                                objectURL
                                            );
                                    },
                                    (error) => {
                                        console.log(error);
                                    }
                                );
                            }
                        });
                        this._contacts.next(contacts);
                    })
                );
        }
    }

    /**
     * Get contact by id
     */
    getContactById(id: string): Observable<any> {
        return this._httpClient
            .get<any>(environment.apiUrl + 'mtc', { params: { id } })
            .pipe(
                map((contact) => {
                    // Update the contact
                    if (contact.social_image) {
                        this.downloadMediaFromUser(
                            contact.social_image
                        ).subscribe(
                            (blob: any) => {
                                let objectURL = URL.createObjectURL(blob);
                                contact['blobImage'] =
                                    this.sanitizer.bypassSecurityTrustUrl(
                                        objectURL
                                    );
                            },
                            (error) => {
                                console.log(error);
                            }
                        );
                    }
                    this._contact.next(contact);
                    // Return the contact
                    return contact;
                }),
                switchMap((contact) => {
                    if (!contact) {
                        return throwError(
                            'Could not found contact with id of ' + id + '!'
                        );
                    }

                    return of(contact);
                })
            );
    }

    /**
     * Create contact
     */
    createContact(teacher: any): Observable<any> {
        return this.contacts$.pipe(
            take(1),
            switchMap((contacts) =>
                this._httpClient
                    .post<any>(
                        environment.apiUrl + 'teacher/add-teacher',
                        teacher
                    )
                    .pipe(
                        map((newContact) => {
                            // Update the contacts with the new contact
                            this._contacts.next([newContact, ...contacts]);

                            // Return the new contact
                            return newContact;
                        })
                    )
            )
        );
    }

    /**
     * Update contact
     *
     * @param id
     * @param contact
     */
    updateContact(id: string, contact: any): Observable<any> {
        return this.contacts$.pipe(
            take(1),
            switchMap((contacts) =>
                this._httpClient
                    .patch<any>(environment.apiUrl + 'user/updateUserAdmin', {
                        id,
                        contact,
                    })
                    .pipe(
                        map((updatedContact) => {
                            // Find the index of the updated contact
                            const index = contacts.findIndex(
                                (item) => item.id === id
                            );

                            // Update the contact
                            contacts[index] = updatedContact;

                            // Update the contacts
                            this._contacts.next(contacts);

                            // Return the updated contact
                            return updatedContact;
                        }),
                        switchMap((updatedContact) =>
                            this.contact$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the contact if it's selected
                                    this._contact.next(updatedContact);

                                    // Return the updated contact
                                    return updatedContact;
                                })
                            )
                        )
                    )
            )
        );
    }
    /**
     * Delete the contact
     *
     * @param id
     */
    deleteAffectation(affectation_id: any): Observable<any> {
        return this._httpClient.delete(
            environment.apiUrl + 'class-rooms/deleteAffectation',
            {
                params: {
                    teacher_id: affectation_id.teacher_id,
                    classroom_id: affectation_id.classroom,
                    module_id: affectation_id.module,
                },
            }
        );
    }

    /**
     * Delete the contact
     *
     * @param id
     */
    deleteContact(id: string): Observable<boolean> {
        return this.contacts$.pipe(
            take(1),
            switchMap((contacts) =>
                this._httpClient
                    .delete('api/apps/contacts/contact', { params: { id } })
                    .pipe(
                        map((isDeleted: boolean) => {
                            // Find the index of the deleted contact
                            const index = contacts.findIndex(
                                (item) => item.id === id
                            );

                            // Delete the contact
                            contacts.splice(index, 1);

                            // Update the contacts
                            this._contacts.next(contacts);

                            // Return the deleted status
                            return isDeleted;
                        })
                    )
            )
        );
    }
    affectationClassRoomModule(affectation: any): Observable<any> {
        return this._httpClient.post(
            environment.apiUrl + 'class-rooms/affectationTeacherModule',
            affectation
        );
    }

    /**
     * Update the avatar of the given contact
     *
     * @param id
     * @param avatar
     */
    uploadAvatar(id: string, avatar: File): Observable<any> {
        return this.contacts$.pipe(
            take(1),
            switchMap((contacts) =>
                this._httpClient
                    .post<any>(
                        'api/apps/contacts/avatar',
                        {
                            id,
                            avatar,
                        },
                        {
                            headers: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                'Content-Type': avatar.type,
                            },
                        }
                    )
                    .pipe(
                        map((updatedContact) => {
                            // Find the index of the updated contact
                            const index = contacts.findIndex(
                                (item) => item.id === id
                            );

                            // Update the contact
                            contacts[index] = updatedContact;

                            // Update the contacts
                            this._contacts.next(contacts);

                            // Return the updated contact
                            return updatedContact;
                        }),
                        switchMap((updatedContact) =>
                            this.contact$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the contact if it's selected
                                    this._contact.next(updatedContact);

                                    // Return the updated contact
                                    return updatedContact;
                                })
                            )
                        )
                    )
            )
        );
    }
}
