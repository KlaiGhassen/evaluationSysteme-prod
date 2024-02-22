import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ProjectService } from '../../dashboards/project/project.service';

@Component({
    selector: 'mailbox-compose',
    templateUrl: './compose.component.html',
})
export class MailboxComposeComponent implements OnInit {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    userForm: FormGroup;

    /**
     * Constructor
     */
    constructor(
        private _projectService: ProjectService,
        public matDialogRef: MatDialogRef<MailboxComposeComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _formBuilder: FormBuilder
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.userForm = this._formBuilder.group({
            title: ['', Validators.required],
            description: [''],
            teacher_task: this.data,
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    /**
     * Discard the message
     */
    discard(): void {
        this.matDialogRef.close();
    }

    send(): void {
        this._projectService
            .addRdiTasks(this.userForm.value)
            .subscribe((task) => this.discard() );
    }
}
