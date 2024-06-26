import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ContactsService {
    // Private
    private _contact: BehaviorSubject<any | null> = new BehaviorSubject(null);
    private _contacts: BehaviorSubject<any[] | null> = new BehaviorSubject(
        null
    );
    private _classRooms: BehaviorSubject<any[] | null> = new BehaviorSubject(
        null
    );
    private _modules: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _allJoin: BehaviorSubject<any[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for contact
     */
    get contact$(): Observable<any> {
        return this._contact.asObservable();
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
    /**
     * Getter for contacts
     */
    get allJoin$(): Observable<any[]> {
        return this._allJoin.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get contacts


    /**
     * Get contacts
     */
    getClassRooms(): Observable<any[]> {
        return this._httpClient
            .get<any[]>(environment.apiUrl + 'teacher/all')
            .pipe(
                tap((contacts) => {
                    this._classRooms.next(contacts);
                })
            );
    }

    /**
     * Get contacts
     */
    getContacts(): Observable<any[]> {
        return this._httpClient
            .get<any[]>(environment.apiUrl + 'students/all')
            .pipe(
                tap((contacts) => {
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
                .get<any[]>(environment.apiUrl + 'students/search', {
                    params: { query },
                })
                .pipe(
                    tap((contacts) => {
                        this._contacts.next(contacts);
                    })
                );
        } else {
            return this._httpClient
                .get<any[]>(environment.apiUrl + 'students/all')
                .pipe(
                    tap((contacts) => {
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
            .get<any>(environment.apiUrl + 'students', { params: { id } })
            .pipe(
                map((contact) => {
                    // Update the contact
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
                        environment.apiUrl + 'students/add-teacher',
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
     * Create contact
     */
    createContactFromFile(teacher: any): Observable<any> {
        return this.contacts$.pipe(
            take(1),
            switchMap((contacts) =>
                this._httpClient
                    .post<any>(
                        environment.apiUrl + 'students/fileStudents',
                        teacher
                    )
                    .pipe(
                        map((newContacts) => {
                            // Update the contacts with the new contact
                            this._contact.next(newContacts);
                            // Return the new contact
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
                    .patch<any>('api/apps/contacts/contact', {
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
    affectationSuperVisor(framingId, idStudent): Observable<any> {
        return this._httpClient.put(
            environment.apiUrl + 'students/affectationFraming',
            { studentId: idStudent, framingId: framingId }
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
