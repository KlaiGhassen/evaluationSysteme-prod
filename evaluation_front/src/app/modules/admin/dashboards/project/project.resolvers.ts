import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';

@Injectable({
    providedIn: 'root',
})
export class ProjectResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _projectService: ProjectService) {}

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
    ): Observable<any> {
        return this._projectService.getData();
    }
}

@Injectable({
    providedIn: 'root',
})
export class NotRdiReservor implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _projectService: ProjectService) {}

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
    ): Observable<any> {
        return this._projectService.getTeachersNotRdi();
    }
}

@Injectable({
    providedIn: 'root',
})
export class RdiTeamResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _projectService: ProjectService) {}

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
    ): Observable<any> {
        return this._projectService.getAffectetionTeachers();
    }
}

@Injectable({
    providedIn: 'root',
})
export class chartResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _projectService: ProjectService) {}

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
    ): Observable<any> {
        return this._projectService.getStudentChart();
    }
}
@Injectable({
    providedIn: 'root',
})
export class StudentNumberResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _projectService: ProjectService) {}

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
    ): Observable<any> {
        return this._projectService.getStudentNumbersChart();
    }
}

@Injectable({
    providedIn: 'root',
})
export class TeachersResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _projectService: ProjectService) {}

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
    ): Observable<any> {
        return this._projectService.getTeachers();
    }
}

@Injectable({
    providedIn: 'root',
})
export class DataResolver implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _projectService: ProjectService) {}

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
    ): Observable<any> {
        return this._projectService.getTeachingData();
    }
}

@Injectable({
    providedIn: 'root',
})
export class DataFraming implements Resolve<any> {
    /**
     * Constructor
     */
    constructor(private _projectService: ProjectService) {}

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
    ): Observable<any> {
        return this._projectService.getDatFraming();
    }
}
