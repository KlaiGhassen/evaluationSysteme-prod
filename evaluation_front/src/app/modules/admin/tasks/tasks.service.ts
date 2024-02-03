import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import {
    ClassRoom,
    Question,
    Sections,
} from 'app/modules/admin/tasks/tasks.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class TasksService {
    // Private
    private _tags: BehaviorSubject<ClassRoom[] | null> = new BehaviorSubject(
        null
    );
    private _task: BehaviorSubject<Sections | null> = new BehaviorSubject(null);
    private _question: BehaviorSubject<Question | null> = new BehaviorSubject(
        null
    );
    private _questions: BehaviorSubject<Question[] | null> =
        new BehaviorSubject(null);

    private _tasks: BehaviorSubject<Sections[] | null> = new BehaviorSubject(
        null
    );

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for tags
     */
    get tags$(): Observable<ClassRoom[]> {
        return this._tags.asObservable();
    }

    /**
     * Getter for task
     */
    get task$(): Observable<Sections> {
        return this._task.asObservable();
    }
    get question$(): Observable<Question> {
        return this._question.asObservable();
    }
    get questions$(): Observable<Question[]> {
        return this._questions.asObservable();
    }

    /**
     * Getter for tasks
     */
    get tasks$(): Observable<Sections[]> {
        return this._tasks.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get tags
     */
    getTags(): Observable<ClassRoom[]> {
        return this._httpClient
            .get<ClassRoom[]>(environment.apiUrl + 'class-rooms')
            .pipe(
                tap((response: any) => {
                    this._tags.next(response);

                })
            );
    }

    /**
     * Crate tag
     *
     * @param tag
     */
    launchQuizz(tag: any): Observable<any> {
        return this._httpClient.post<any>(
            environment.apiUrl + 'class-rooms/question-to-answer',
            { tag }
        );
    }

    /**
     * Crate tag
     *
     * @param tag
     */
    createTag(tag: ClassRoom): Observable<ClassRoom> {
        return this.tags$.pipe(
            take(1),
            switchMap((tags) =>
                this._httpClient
                    .post<ClassRoom>('api/apps/tasks/tag', { tag })
                    .pipe(
                        map((newTag) => {
                            // Update the tags with the new tag
                            this._tags.next([...tags, newTag]);
                            // Return new tag from observable
                            return newTag;
                        })
                    )
            )
        );
    }

    /**
     * Update the tag
     *
     * @param id
     * @param tag
     */
    updateTag(id: string, tag: ClassRoom): Observable<ClassRoom> {
        return this.tags$.pipe(
            take(1),
            switchMap((tags) =>
                this._httpClient
                    .patch<ClassRoom>('api/apps/tasks/tag', {
                        id,
                        tag,
                    })
                    .pipe(
                        map((updatedTag) => {
                            // Find the index of the updated tag
                            const index = tags.findIndex(
                                (item) => item.classroom_id === id
                            );

                            // Update the tag
                            tags[index] = updatedTag;

                            // Update the tags
                            this._tags.next(tags);

                            // Return the updated tag
                            return updatedTag;
                        })
                    )
            )
        );
    }

    /**
     * Get tasks
     */
    getTasks(): Observable<Sections[]> {
        return this._httpClient
            .get<Sections[]>(
                environment.apiUrl + 'questions/sections-affectation'
            )
            .pipe(
                tap((response) => {
                    this._tasks.next(response);
                })
            );
    }

    /**
     * Update tasks orders
     *
     * @param tasks
     */
    updateTasksOrders(tasks: Sections[]): Observable<Sections[]> {
        return this._httpClient.patch<Sections[]>('api/apps/tasks/order', {
            tasks,
        });
    }

    /**
     * Search tasks with given query
     *
     * @param query
     */
    searchTasks(query: string): Observable<Sections[] | null> {
        return this._httpClient.get<Sections[] | null>(
            'api/apps/tasks/search',
            {
                params: { query },
            }
        );
    }

    /**
     * Get tasks
     */
    getQuestions(): Observable<Question[]> {
        return this._httpClient
            .get<Question[]>(environment.apiUrl + 'questions')
            .pipe(
                tap((response) => {
                    this._questions.next(response);
                })
            );
    }

    /**
     * Get task by id
     */
    getQuestionById(id: string): Observable<Question> {
        return this._questions.pipe(
            take(1),
            map((tasks) => {
                // Find the task
                const task =
                    tasks.find((item) => item.id_question == id) || null;

                // Update the task
                this._question.next(task);

                // Return the task
                return task;
            }),
            switchMap((task) => {
                if (!task) {
                    return throwError(
                        'Could not found task with id of ' + id + '!'
                    );
                }

                return of(task);
            })
        );
    }

    /**
     * Get task by id
     */
    getTaskById(id: string): Observable<Sections> {
        return this._tasks.pipe(
            take(1),
            map((tasks) => {
                // Find the task
                const task =
                    tasks.find((item) => item.section_id == id) || null;

                // Update the task
                this._task.next(task);

                // Return the task
                return task;
            }),
            switchMap((task) => {
                if (!task) {
                    return throwError(
                        'Could not found task with id of ' + id + '!'
                    );
                }

                return of(task);
            })
        );
    }

    /**
     * Create task
     *
     * @param type
     */
    createTask(): Observable<Sections> {
        return this.tasks$.pipe(
            take(1),
            switchMap((tasks) =>
                this._httpClient
                    .post<Sections>(
                        environment.apiUrl + 'questions/sections',
                        {}
                    )
                    .pipe(
                        map((newTask) => {
                            // Update the tasks with the new task
                            this._tasks.next([newTask, ...tasks]);

                            // Return the new task
                            return newTask;
                        })
                    )
            )
        );
    }
    /**
     * Create task
     *
     * @param type
     */
    createQuestion(): Observable<Question> {
        return this.questions$.pipe(
            take(1),
            switchMap((tasks) =>
                this._httpClient
                    .post<Question>(environment.apiUrl + 'questions', {})
                    .pipe(
                        map((newTask) => {
                            // Update the tasks with the new task
                            this._questions.next([newTask, ...tasks]);

                            // Return the new task
                            return newTask;
                        })
                    )
            )
        );
    }

    /**
     * Update task
     *
     * @param id
     * @param task
     */
    updateTask(task: Sections): Observable<Sections> {
        return this.tasks$.pipe(
            take(1),
            switchMap((tasks) =>
                this._httpClient
                    .patch<Sections>(
                        environment.apiUrl + 'questions/sections-affectation',
                        { task }
                    )
                    .pipe(
                        map((updatedTask) => {
                            // Find the index of the updated task
                            const index = tasks.findIndex(
                                (item) => item.section_id === task.section_id
                            );

                            // Update the task
                            tasks[index] = updatedTask;

                            // Update the tasks
                            this._tasks.next(tasks);

                            // Return the updated task
                            return updatedTask;
                        }),
                        switchMap((updatedTask) =>
                            this.task$.pipe(
                                take(1),
                                filter(
                                    (item) =>
                                        item &&
                                        item.section_id === task.section_id
                                ),
                                tap(() => {
                                    // Update the task if it's selected
                                    this._task.next(updatedTask);

                                    // Return the updated task
                                    return updatedTask;
                                })
                            )
                        )
                    )
            )
        );
    }
    /**
     * Update task
     *
     * @param id
     * @param task
     */
    updateQuestion(task: any): Observable<Question> {
        return this.questions$.pipe(
            take(1),
            switchMap((tasks) =>
                this._httpClient
                    .patch<Question>(environment.apiUrl + 'questions', { task })
                    .pipe(
                        map((updatedTask) => {
                            // Find the index of the updated task
                            const index = tasks.findIndex(
                                (item) => item.id_question === task.id_question
                            );
                            // Update the task
                            tasks[index] = updatedTask;

                            // Update the tasks
                            this._questions.next(tasks);
                            // Return the updated task
                            return updatedTask;
                        }),
                        switchMap((updatedTask) =>
                            this.question$.pipe(
                                take(1),
                                filter(
                                    (item) =>
                                        item &&
                                        item.id_question === task.id_question
                                ),
                                tap(() => {
                                    // Update the task if it's selected
                                    this._question.next(updatedTask);
                                    this.getTasks().subscribe();
                                    // Return the updated task
                                    return updatedTask;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Delete the task
     *
     * @param id
     */
    deleteTask(id: string): Observable<boolean> {
        return this.tasks$.pipe(
            take(1),
            switchMap((tasks) =>
                this._httpClient
                    .delete('api/apps/tasks/task', { params: { id } })
                    .pipe(
                        map((isDeleted: boolean) => {
                            // Find the index of the deleted task
                            const index = tasks.findIndex(
                                (item) => item.section_id === id
                            );

                            // Delete the task
                            tasks.splice(index, 1);

                            // Update the tasks
                            this._tasks.next(tasks);

                            // Return the deleted status
                            return isDeleted;
                        })
                    )
            )
        );
    }
}
