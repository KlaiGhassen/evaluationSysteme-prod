import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TasksService } from 'app/modules/admin/tasks/tasks.service';
import {
    ClassRoom,
    Question,
    Sections,
} from 'app/modules/admin/tasks/tasks.types';

@Injectable({
    providedIn: 'root',
})
export class TasksTagsResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _tasksService: TasksService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<ClassRoom[]> {
        return this._tasksService.getTags();
    }
}

@Injectable({
    providedIn: 'root',
})
export class TasksResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _tasksService: TasksService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<Sections[]> {
        return this._tasksService.getTasks();
    }
}

@Injectable({
    providedIn: 'root',
})
export class QuestionsResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _tasksService: TasksService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<Question[]> {
        return this._tasksService.getQuestions();
    }
}

@Injectable({
    providedIn: 'root',
})
export class QuestionsQuestionResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _router: Router, private _tasksService: TasksService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<Question> {
        return this._tasksService
            .getQuestionById(route.paramMap.get('questionId'))
            .pipe(
                // Error here means the requested task is not available
                catchError((error) => {
                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url
                        .split('/')
                        .slice(0, -1)
                        .join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
    }
}

@Injectable({
    providedIn: 'root',
})
export class TasksTaskResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _router: Router, private _tasksService: TasksService) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<Sections> {
        return this._tasksService.getTaskById(route.paramMap.get('id')).pipe(
            // Error here means the requested task is not available
            catchError((error) => {
                // Log the error
                console.error(error);

                // Get the parent url
                const parentUrl = state.url.split('/').slice(0, -1).join('/');

                // Navigate to there
                this._router.navigateByUrl(parentUrl);

                // Throw an error
                return throwError(error);
            })
        );
    }
}
