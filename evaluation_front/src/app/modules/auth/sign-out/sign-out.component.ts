import {
    Component,
    NgZone,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { finalize, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AuthService } from 'app/core/auth/auth.service';
import {
    MsalService,
    MsalBroadcastService,
    MSAL_GUARD_CONFIG,
    MsalGuardConfiguration,
} from '@azure/msal-angular';
@Component({
    selector: 'auth-sign-out',
    templateUrl: './sign-out.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class AuthSignOutComponent implements OnInit, OnDestroy {
    countdown: number = 5;
    countdownMapping: any = {
        '=1': '# second',
        other: '# seconds',
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private authService: MsalService,
        private _authService: AuthService,
        private _router: Router,
        private _ngZone: NgZone
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
  
    /**
     * On init
     */
    ngOnInit(): void {
        // Redirect after the countdown
        timer(1000, 1000)
            .pipe(
                finalize(() => {
                    this._authService.signOut().subscribe((res) => {
                        this._router.navigate(['/sign-in']);
                        window.location.reload();
                    });
                }),
                takeWhile(() => this.countdown > 0),
                takeUntil(this._unsubscribeAll),
                tap(() => this.countdown--)
            )
            .subscribe();
    }
    signOut(): void {
        this._authService.signOut().subscribe((res) => {
            this._router.navigate(['/sign-in']);
            window.location.reload();
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
