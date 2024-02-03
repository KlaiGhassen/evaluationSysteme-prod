import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    Resolve,
    RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { ProjectService } from 'app/modules/studentComponents/dashboards/project/project.service';

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
export class RosResolver implements Resolve<any> {
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
        return this._projectService.getRos();
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
export class framingResolver implements Resolve<any> {
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
        return this._projectService.getFraming();
    }
}
