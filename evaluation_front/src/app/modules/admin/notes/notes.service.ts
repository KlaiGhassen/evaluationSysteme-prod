import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, concat, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Label, Note, Task } from 'app/modules/admin/notes/notes.types';
import { cloneDeep } from 'lodash-es';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class NotesService {
    // Private
    private _labels: BehaviorSubject<Label[] | null> = new BehaviorSubject(
        null
    );
    private _note: BehaviorSubject<Note | null> = new BehaviorSubject(null);
    private _notes: BehaviorSubject<Note[] | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for labels
     */
    get labels$(): Observable<Label[]> {
        return this._labels.asObservable();
    }

    /**
     * Getter for notes
     */
    get notes$(): Observable<Note[]> {
        return this._notes.asObservable();
    }

    /**
     * Getter for note
     */
    get note$(): Observable<Note> {
        return this._note.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get labels
     */
    getLabels(): Observable<Label[]> {
        return this._httpClient.get<Label[]>(environment.apiUrl + 'up').pipe(
            tap((response: Label[]) => {
                this._labels.next(response);
            })
        );
    }

    /**
     * Add label
     *
     * @param title
     */
    addLabel(title: string): Observable<Label[]> {
        return this._httpClient
            .post<Label[]>(environment.apiUrl + 'up', { title })
            .pipe(
                tap((labels) => {
                    // Update the labels
                    this._labels.next(labels);
                })
            );
    }

    /**
     * Update label
     *
     * @param label
     */
    updateLabel(label: Label): Observable<Label[]> {
        return this._httpClient
            .patch<Label[]>('api/apps/notes/labels', { label })
            .pipe(
                tap((labels) => {
                    // Update the notes
                    this.getNotes(label.name_up).subscribe();

                    // Update the labels
                    this._labels.next(labels);
                })
            );
    }

    /**
     * Delete a label
     *
     * @param id
     */
    deleteLabel(id: string): Observable<Label[]> {
        return this._httpClient
            .delete<Label[]>('api/apps/notes/labels', { params: { id } })
            .pipe(
                tap((labels) => {
                    // Update the notes

                    // Update the labels
                    this._labels.next(labels);
                })
            );
    }

    /**
     * Get notes
     */
    getNotes(upName): Observable<any[]> {
        return this._httpClient
            .get<any[]>(environment.apiUrl + 'up/hearchy', {
                params: {
                    upName,
                    department: 'tic',
                },
            })
            .pipe(
                tap((response: any[]) => {
                    this._notes.next(response);
                })
            );
    }

    /**
     * Get note by id
     */
    getNoteById(id: string): Observable<Note> {
        return this._notes.pipe(
            take(1),
            map((notes) => {
                // Find within the folders and files
                const note = notes.find((value) => value.id === id) || null;

                // Update the note
                this._note.next(note);

                // Return the note
                return note;
            }),
            switchMap((note) => {
                if (!note) {
                    return throwError(
                        'Could not found the note with id of ' + id + '!'
                    );
                }

                return of(note);
            })
        );
    }
}
