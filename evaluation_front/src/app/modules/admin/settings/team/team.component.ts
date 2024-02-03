import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { ProjectService } from '../../dashboards/project/project.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'settings-team',
    templateUrl: './team.component.html',
})
export class SettingsTeamComponent implements OnInit {
    members: any[];
    membersRdi: any[];
    roles: any[];
    memberId: any = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    configForm: FormGroup;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,

        private _projectService: ProjectService,
        private _fuseConfirmationService: FuseConfirmationService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._projectService.notRdi$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                this.members = data;
            });
        this._projectService.affectationTeachers$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                this.membersRdi = data;
            });
        // Setup the team members
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

    deleteMember(id) {
        this.configForm = this._formBuilder.group({
            title: 'add to Rdi team',
            message:
                'Are you sure you want to add this teacher to rdi team? <span class="font-medium">This action cannot be undone!</span>',
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

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._projectService.deleteToRdi(id).subscribe((data) => {
                    this.members.push(data);
                });
            }
        });
        // this._projectService.deleteMember(id);
    }
    addMember(id) {
        if (id) {
            this.configForm = this._formBuilder.group({
                title: 'add to Rdi team',
                message:
                    'Are you sure you want to add this teacher to rdi team? <span class="font-medium">This action cannot be undone!</span>',
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

            dialogRef.afterClosed().subscribe((result) => {
                if (result === 'confirmed') {
                    this._projectService.addToRdi(id).subscribe((data) => {
                        this.memberId = null;
                        const indexToDelete = this.members.findIndex(
                            (obj) => obj.id === data.id
                        );

                        if (indexToDelete !== -1) {
                            this.members.splice(indexToDelete, 1);
                        }
                    });
                }
            });
        } else {
            this.configForm = this._formBuilder.group({
                title: 'error adding to Rdi team',
                message:
                    'select a teacher to add  <span class="font-medium">This action cannot be undone!</span>',
                icon: this._formBuilder.group({
                    show: true,
                    name: 'heroicons_outline:exclamation',
                    color: 'warn',
                }),
                actions: this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show: true,
                        label: 'confirm',
                        color: 'warn',
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
        }
    }
}
