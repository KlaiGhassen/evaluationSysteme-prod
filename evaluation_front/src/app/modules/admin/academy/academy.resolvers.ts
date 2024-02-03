import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
    Classroom,
    UeModules,
    CoursesUeClassroom,
    Module,
} from 'app/modules/admin/academy/academy.types';
import { AcademyService } from 'app/modules/admin/academy/academy.service';

@Injectable({
    providedIn: 'root',
})
export class AcademyCategoriesResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _academyService: AcademyService) {}

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
    ): Observable<Classroom[]> {
        return this._academyService.getCategories();
    }
}

@Injectable({
    providedIn: 'root',
})
export class AcademyCoursesResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _academyService: AcademyService) {}

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
    ): Observable<Module[]> {
        return this._academyService.getCourses();
    }
}

/**
 * Resolver
 *
 * @param route
 * @param state
 */
@Injectable({
    providedIn: 'root',
})
export class AcademyCumResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _academyService: AcademyService) {}

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
    ): Observable<UeModules[]> {
        return this._academyService.getCoursesUeClassroom();
    }
}

@Injectable({
    providedIn: 'root',
})
export class AcademyCourseResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _academyService: AcademyService
    ) {}

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
    ): Observable<Module> {
        return this._academyService
            .getCourseById(route.paramMap.get('id'))
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
export class TasksTagsResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _academyService: AcademyService) {}

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
    ): Observable<any[]> {
        return this._academyService.getTags();
    }
}
@Injectable({
    providedIn: 'root',
})
export class RoTeachers implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _academyService: AcademyService) {}

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
    ): Observable<any[]> {
        return this._academyService.getRo();
    }
}
