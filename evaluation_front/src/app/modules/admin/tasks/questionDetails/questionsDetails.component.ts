import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil, tap } from 'rxjs/operators';
import { assign } from 'lodash-es';
import * as moment from 'moment';
import {
    ClassRoom,
    Question,
    Sections,
} from 'app/modules/admin/tasks/tasks.types';
import { TasksListComponent } from 'app/modules/admin/tasks/list/list.component';
import { TasksService } from 'app/modules/admin/tasks/tasks.service';

@Component({
    selector: 'tasks-details',
    templateUrl: './questionsDetails.component.html',
})
export class QuestionsDetailsComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('titleField') private _titleField: ElementRef;
    saveButton: Boolean = true;
    task: any;
    taskForm: FormGroup;
    tasks: Question[];
    sections: Sections[];
    title: any;
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _renderer2: Renderer2,
        private _router: Router,
        private _tasksListComponent: TasksListComponent,
        private _tasksService: TasksService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this._tasksListComponent.matDrawer.open();

        // Create the task form
        this.taskForm = this._formBuilder.group({
            id_question: [''],
            question: [''],
            section_id: [''],
            order: [0],
        });

        // Get the tasks
        this._tasksService.tasks$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tasks: Sections[]) => {
                this.sections = tasks;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the tasks
        this._tasksService.questions$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tasks: Question[]) => {
                this.tasks = tasks;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the task
        this._tasksService.question$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((task: Question) => {
                // Open the drawer in case it is closed
                this._tasksListComponent.matDrawer.open();
                // Get the task
                this.task = task;

                // Patch values to the form from the task
                this.taskForm.patchValue(task, { emitEvent: false });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        if (this.task.title) {
            this.title = this.sections.filter(
                (section) => section.section_id === this.task.section_id
            )[0].title;
        }

        // Update task when there is a value change on the task form
        this.taskForm.valueChanges
            .pipe(
                tap((value) => {
                    // Update the task object
                    //  this.task = assign(this.task, value);
                }),
                debounceTime(300),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe((value) => {
                this.saveButton = false;
                // Update the task on the server
                // this._tasksService.updateTask(value.id, value).subscribe();

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Listen for NavigationEnd event to focus on the title field
        this._router.events
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter((event) => event instanceof NavigationEnd)
            )
            .subscribe(() => {
                // Focus on the title field
                this._titleField.nativeElement.focus();
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // Listen for matDrawer opened change
        this._tasksListComponent.matDrawer.openedChange
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter((opened) => opened)
            )
            .subscribe(() => {
                // Focus on the title element
                this._titleField.nativeElement.focus();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        // Dispose the overlay
        if (this._tagsPanelOverlayRef) {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._tasksListComponent.matDrawer.close();
    }

    /**
     * Toggle the completed status
     */
    toggleCompleted(): void {
        // Get the form control for 'completed'
        const completedFormControl = this.taskForm.get('completed');

        // Toggle the completed status
        completedFormControl.setValue(!completedFormControl.value);
    }

    /**
     * Delete the task
     */
    deleteTask(): void {
        // Get the current task's id
        const id = this.task.id_question;

        // Get the next/previous task's id
        const currentTaskIndex = this.tasks.findIndex(
            (item) => item.id_question === id
        );
        const nextTaskIndex =
            currentTaskIndex +
            (currentTaskIndex === this.tasks.length - 1 ? -1 : 1);
        const nextTaskId =
            this.tasks.length === 1 && this.tasks[0].id_question === id
                ? null
                : this.tasks[nextTaskIndex].id_question;

        // Delete the task
        this._tasksService.deleteTask(id).subscribe((isDeleted) => {
            // Return if the task wasn't deleted...
            if (!isDeleted) {
                return;
            }

            // Navigate to the next task if available
            if (nextTaskId) {
                this._router.navigate(['../', nextTaskId], {
                    relativeTo: this._activatedRoute,
                });
            }
            // Otherwise, navigate to the parent
            else {
                this._router.navigate(['../'], {
                    relativeTo: this._activatedRoute,
                });
            }
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    save() {
        if (this.taskForm.dirty && this.taskForm.valid) {
            this.task = assign(this.task, this.taskForm.value);
            this._tasksService.updateQuestion(this.task).subscribe(() => {
                this.saveButton = true;
            });
        }
    }
}
