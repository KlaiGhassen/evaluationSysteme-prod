import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { SolanaServicesService } from '../solana-services/solana-services.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';

declare global {
    interface Window {
        phantom?: {
            solana?: {
                isPhantom?: any;
            };
        };
    }
}

@Component({
    selector: 'example',
    templateUrl: './example.component.html',
})
export class ExampleComponent {
    /**
     * Constructor
     */
    provider: any = this;

    constructor(private _router: Router, private _userService: UserService) {
        this._userService.user$.subscribe((user) => {
            const isPhantomInstalled = window.phantom?.solana?.isPhantom;

            switch (user.role) {
                case 'ADMIN':
                    this._router.navigate(['/classrooms']);
                    break;
                case 'STUDENT':
                    this._router.navigate(['/MyTeachers']);

                    break;
                case 'TEACHER':
                    this._router.navigate(['/Dashboard']);
                    break;
                case 'RO':
                    this._router.navigate(['/Dashboard']);
                    break;
                case 'RDI':
                    this._router.navigate(['/Dashboard']);
                    break;
                case 'CUP':
                    this._router.navigate(['/Dashboard']);
                    break;
                case 'CD':
                    this._router.navigate(['/Dashboard']);
                    break;

                default:
                    break;
            }
        });
    }
}
