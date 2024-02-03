import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { environment } from 'environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService
    ) {}
    refresh = false;

    /**
     * Intercept
     *
     * @param req
     * @param next
     */
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        // Clone the request object
        let newReq = req.clone();

        // Request
        //
        // If the access token didn't expire, add the Authorization header.
        // We won't add the Authorization header if the access token expired.
        // This will force the server to return a "401 Unauthorized" response
        // for the protected API routes which our response interceptor will
        // catch and delete the access token from the local storage while logging
        // the user out from the app.
        if (
            this._authService.accessToken &&
            !AuthUtils.isTokenExpired(this._authService.accessToken)
        ) {
            newReq = req.clone({
                headers: req.headers.set(
                    'Authorization',
                    'Bearer ' + this._authService.accessToken
                ),
            });
        }

        // Response
        return next.handle(newReq).pipe(
            catchError((error) => {
                // Catch "401 Unauthorized" responses
                if (
                    error instanceof HttpErrorResponse &&
                    error.status === 401 &&
                    !this.refresh
                ) {
                    // Sign out
                    //  this._authService.signOut();
                    this.refresh = true;
                    return this._httpClient
                        .get<any>(environment.apiUrl + 'auth/token', {
                            withCredentials: true,
                        })
                        .pipe(
                            switchMap((response: any) => {
                                this._authService.accessToken =
                                    response.accessToken;
                                this.refresh = false;


                                return next.handle(
                                    req.clone({
                                        headers: req.headers.set(
                                            'Authorization',
                                            'Bearer ' +
                                                this._authService.accessToken
                                        ),
                                   
                                    })
                                );
                           
                            })
                        );

                    // this._authService
                    //     .signInUsingToken()
                    //     .pipe()
                    //     .subscribe((response) => {
                    //         if (response == true) {
                    //             return next.handle(
                    //                 newReq.clone({
                    //                     headers: req.headers.set(
                    //                         'Authorization',
                    //                         'Bearer ' +
                    //                             this._authService.accessToken
                    //                     ),
                    //                 })
                    //             );
                    //         }
                    //     });
                    // Reload the app
                    // location.reload();
                }
                return throwError(error);
            })
        );
    }
}
