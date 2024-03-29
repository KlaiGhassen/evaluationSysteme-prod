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
    templateUrl: './details.component.html',
})
export class TasksDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('titleField') private _titleField: ElementRef;
    saveButton: Boolean = true;
    questionToAnswer: any;
    launch: Boolean = true;
    tags: ClassRoom[];
    tagsEditMode: boolean = false;
    filteredTags: ClassRoom[];
    task: Sections;
    taskForm: FormGroup;
    tasks: Sections[];
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
            section_id: [''],
            title: [''],
            notes: [''],
            dueDate: [null],
            classRooms: [],
            order: [0],
        });

        // Get the tags
        this._tasksService.tags$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tags: ClassRoom[]) => {
                this.tags = tags;
                this.filteredTags = tags;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the tasks
        this._tasksService.tasks$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tasks: Sections[]) => {
                this.tasks = tasks;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the task
        this._tasksService.task$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((task: Sections) => {
                // Open the drawer in case it is closed
                this._tasksListComponent.matDrawer.open();
                // Get the task
                this.task = task;

                // Patch values to the form from the task
                this.taskForm.patchValue(task, { emitEvent: false });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

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
     * Open tags panel
     */
    openTagsPanel(): void {
        // Create the overlay
        this._tagsPanelOverlayRef = this._overlay.create({
            backdropClass: '',
            hasBackdrop: true,
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay
                .position()
                .flexibleConnectedTo(this._tagsPanelOrigin.nativeElement)
                .withFlexibleDimensions(true)
                .withViewportMargin(64)
                .withLockedPosition(true)
                .withPositions([
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'top',
                    },
                ]),
        });

        // Subscribe to the attachments observable
        this._tagsPanelOverlayRef.attachments().subscribe(() => {
            // Focus to the search input once the overlay has been attached
            this._tagsPanelOverlayRef.overlayElement
                .querySelector('input')
                .focus();
        });

        // Create a portal from the template
        const templatePortal = new TemplatePortal(
            this._tagsPanel,
            this._viewContainerRef
        );

        // Attach the portal to the overlay
        this._tagsPanelOverlayRef.attach(templatePortal);

        // Subscribe to the backdrop click
        this._tagsPanelOverlayRef.backdropClick().subscribe(() => {
            // If overlay exists and attached...
            if (
                this._tagsPanelOverlayRef &&
                this._tagsPanelOverlayRef.hasAttached()
            ) {
                // Detach it
                this._tagsPanelOverlayRef.detach();

                // Reset the tag filter
                this.filteredTags = this.tags;

                // Toggle the edit mode off
                this.tagsEditMode = false;
            }

            // If template portal exists and attached...
            if (templatePortal && templatePortal.isAttached) {
                // Detach it
                templatePortal.detach();
            }
        });
    }

    /**
     * Toggle the tags edit mode
     */
    toggleTagsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode;
    }

    /**
     * Filter tags
     *
     * @param event
     */
    filterTags(event): void {
        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the tags
        this.filteredTags = this.tags.filter((tag) =>
            tag.name_class.toLowerCase().includes(value)
        );
    }

    /**
     * Filter tags input key down event
     *
     * @param event
     */
    filterTagsInputKeyDown(event): void {
        // Return if the pressed key is not 'Enter'
        if (event.key !== 'Enter') {
            return;
        }

        // If there is no tag available...
        if (this.filteredTags.length === 0) {
            // Create the tag
            this.createTag(event.target.value);

            // Clear the input
            event.target.value = '';

            // Return
            return;
        }

        // If there is a tag...
        const tag = this.filteredTags[0];
        const isTagApplied = this.task.classRooms.find(
            (id) => id === tag.classroom_id
        );

        // If the found tag is already applied to the task...
        if (isTagApplied) {
            // Remove the tag from the task
            this.deleteTagFromTask(tag);
        } else {
            // Otherwise add the tag to the task
            this.addTagToTask(tag);
        }
    }

    /**
     * Create a new tag
     *
     * @param title
     */
    createTag(name_class: string): void {
        const tag = {
            name_class,
        };

        // Create tag on the server
        this._tasksService.createTag(tag).subscribe((response) => {
            // Add the tag to the task
            this.addTagToTask(response);
        });
    }

    /**
     * Update the tag title
     *
     * @param tag
     * @param event
     */
    updateTagTitle(tag: ClassRoom, event): void {
        // Update the title on the tag
        tag.name_class = event.target.value;

        // Update the tag on the server
        this._tasksService
            .updateTag(tag.classroom_id, tag)
            .pipe(debounceTime(300))
            .subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Add tag to the task
     *
     * @param tag
     */
    addTagToTask(tag: ClassRoom): void {
        // Add the tag
        this.task.classRooms.unshift(tag.classroom_id);
        // Update the task form
        this.taskForm.get('classRooms').patchValue(this.task.classRooms);
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Delete tag from the task
     *
     * @param tag
     */
    deleteTagFromTask(tag: ClassRoom): void {
        // Remove the tag
        this.task.classRooms.splice(
            this.task.classRooms.findIndex((item) => item === tag.classroom_id),
            1
        );

        // Update the task form
        this.taskForm.get('classRooms').patchValue(this.task.classRooms);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle task tag
     *
     * @param tag
     */
    toggleTaskTag(tag: ClassRoom): void {
        if (this.task.classRooms.includes(tag.classroom_id)) {
            this.deleteTagFromTask(tag);
        } else {
            this.addTagToTask(tag);
        }
    }

    /**
     * Should the create tag button be visible
     *
     * @param inputValue
     */
    shouldShowCreateTagButton(inputValue: string): boolean {
        return !!!(
            inputValue === '' ||
            this.tags.findIndex(
                (tag) =>
                    tag.name_class.toLowerCase() === inputValue.toLowerCase()
            ) > -1
        );
    }

    /**
     * Set the task priority
     *
     * @param priority
     */
    setTaskPriority(priority): void {
        // Set the value
        this.taskForm.get('priority').setValue(priority);
    }

    /**
     * Check if the task is overdue or not
     */
    isOverdue(): boolean {
        return moment(this.task.dueDate, moment.ISO_8601).isBefore(
            moment(),
            'days'
        );
    }

    /**
     * Delete the task
     */
    deleteTask(): void {
        // Get the current task's id
        const id = this.task.section_id;

        // Get the next/previous task's id
        const currentTaskIndex = this.tasks.findIndex(
            (item) => item.section_id === id
        );
        const nextTaskIndex =
            currentTaskIndex +
            (currentTaskIndex === this.tasks.length - 1 ? -1 : 1);
        const nextTaskId =
            this.tasks.length === 1 && this.tasks[0].section_id === id
                ? null
                : this.tasks[nextTaskIndex].section_id;

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
        return item.classroom_id || index;
    }

    save() {
        if (this.taskForm.valid && this.taskForm.dirty) {
            this.task = assign(this.task, this.taskForm.value);
            this._tasksService.updateTask(this.task).subscribe();
        }
    }

    lanchQuizz() {
        this.task.classRooms.forEach((classRoom) => {
            let tag = {
                classroom_id: classRoom,
                section_id: this.task.section_id,
            };
            this._tasksService
                .launchQuizz(tag)
                .subscribe();
        });
    }
}
