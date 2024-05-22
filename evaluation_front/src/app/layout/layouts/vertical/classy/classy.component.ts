import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import {
    FuseNavigationService,
    FuseVerticalNavigationComponent,
} from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { SolanaServicesService } from 'app/modules/admin/solana-services/solana-services.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FormBuilder, FormGroup } from '@angular/forms';

declare global {
    interface Window {
        Buffer?: any;
        phantom?: {
            solana?: {
                isPhantom?: any;
            };
        };
    }
}
@Component({
    selector: 'classy-layout',
    templateUrl: './classy.component.html',
})
export class ClassyLayoutComponent implements OnInit, OnDestroy {
    isScreenSmall: boolean;
    navigation: Navigation;
    user: User;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    provider: any = this;
    isconnected: boolean = false;
    configForm: FormGroup;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _solanaService: SolanaServicesService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService
    ) {
        // Subscribe to the user service
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        let q = localStorage.getItem('publicKeywallet');
        if (
            this.user.role !== 'TEACHER' &&
            this.user.role !== 'CUP' &&
            this.user.role !== 'CD' &&
            this.user.role !== 'RO' &&
            this.user.role !== 'RDI'
        ) {
            // if (q != '') {
            //     this.connectWallet();
            // } else {
            //     this.isconnected = true;
            // }
        }
        this.isconnected = true;

        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                this.navigation = navigation;
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void {
        // Get the navigation
        const navigation =
            this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(
                name
            );

        if (navigation) {
            // Toggle the opened status
            navigation.toggle();
        }
    }

    async connectWallet() {
        const isPhantomInstalled = window.phantom?.solana?.isPhantom;
        if (isPhantomInstalled) {
            await this._solanaService.connectWallet();
            let pbuKey = localStorage.getItem('publicKeywallet');
            if (pbuKey) {
                this.isconnected = true;
            }
        } else {
            this.configForm = this._formBuilder.group({
                title: 'Install Phantom wallet to get crypto',
                message:
                    'You need to install Phantom wallet to get crypto <a href="hhttps://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa>Click here !!</a>',
                icon: this._formBuilder.group({
                    show: true,
                    name: 'heroicons_outline:exclamation',
                    color: 'info',
                }),
                actions: this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show: true,
                        label: 'confirm',
                        color: 'primary',
                    }),
                    cancel: this._formBuilder.group({
                        show: true,
                        label: 'Cancel',
                    }),
                }),
                dismissible: true,
            });
            const dialogRef = this._fuseConfirmationService.open(
                this.configForm.value
            );
            dialogRef.beforeClosed().subscribe((result) => {
                if (result === 'confirmed' && !isPhantomInstalled) {
                    window.open(
                        'https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa',
                        '_blank'
                    );
                }
                window.location.reload();
            });
        }
    }
    async createToken() {
        this._solanaService.createToken();
    }
    async mintToken() {
        this._solanaService.mintToken();
    }

    async checkBalance() {
        this._solanaService.checkBalance();
    }
    async transaction() {
        this._solanaService.sendToken();
    }
}
