import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UserService } from 'app/core/user/user.service';
import { CalendarService } from 'app/modules/calendar/calendar.service';

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
    configForm: FormGroup;

    data = {
        full_name: '',
        classe: '',
        date_cours: '',
        seance: '',
    };
    constructor(
        private route: ActivatedRoute,
        private _calendarService: CalendarService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _router: Router
    ) {
        this.data.full_name = this.route.snapshot.paramMap.get('full_name');
        this.data.classe = this.route.snapshot.paramMap.get('Classe');
        this.data.date_cours = this.route.snapshot.paramMap.get('date_cours');
        this.data.seance = this.route.snapshot.paramMap.get('seance');

        this._calendarService.addPresence(this.data).subscribe((response) => {
            if (response == true) {
                this.configForm = this._formBuilder.group({
                    title: 'Presence',
                    message: 'presence Confirmed successfully ',
                    icon: this._formBuilder.group({
                        show: true,
                        name: 'heroicons_outline:exclamation',
                        color: 'info',
                    }),
                    actions: this._formBuilder.group({
                        confirm: this._formBuilder.group({
                            show: true,
                            label: 'confirm',
                            color: 'info',
                        }),
                        cancel: this._formBuilder.group({
                            show: true,
                            label: 'Cancel',
                        }),
                    }),
                    dismissible: true,
                });
            } else {
                this.configForm = this._formBuilder.group({
                    title: 'Confirm Reclamations',
                    message:
                        'Are you sure you want to confirm this reclamation ?',
                    icon: this._formBuilder.group({
                        show: true,
                        name: 'heroicons_outline:exclamation',
                        color: 'info',
                    }),
                    actions: this._formBuilder.group({
                        confirm: this._formBuilder.group({
                            show: true,
                            label: 'confirm',
                            color: 'info',
                        }),
                    }),
                    dismissible: true,
                });
            }
            const dialogRef = this._fuseConfirmationService.open(
                this.configForm.value
            );
            dialogRef.beforeClosed().subscribe((result) => {
                if (result == 'confirmed') {
                    this._router.navigate(['/MyTeachers']);
                } else {
                    this._router.navigate(['/MyTeachers']);
                }
            });
        });
    }
}
