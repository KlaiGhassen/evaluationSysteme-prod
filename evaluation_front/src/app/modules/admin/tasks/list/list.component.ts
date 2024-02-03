import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import {
    FuseNavigationService,
    FuseVerticalNavigationComponent,
} from '@fuse/components/navigation';
import {
    ClassRoom,
    Question,
    Sections,
} from 'app/modules/admin/tasks/tasks.types';
import { TasksService } from 'app/modules/admin/tasks/tasks.service';

@Component({
    selector: 'tasks-list',
    templateUrl: './list.component.html',
})
export class TasksListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    drawerMode: 'side' | 'over';
    selectedTask: Sections;
    selectedQuestion: Question;
    tags: ClassRoom[];
    tasks: Sections[];
    questions: Question[];
    index: number;

    tasksCount: any = {
        completed: 0,
        incomplete: 0,
        total: 0,
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _tasksService: TasksService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the tags
        this._tasksService.tags$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tags: ClassRoom[]) => {
                this.tags = tags;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the tasks
        this._tasksService.tasks$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tasks: Sections[]) => {
                this.tasks = tasks;

                // Update the counts
                // this.tasksCount.total = this.tasks.filter(task => task.type === 'task').length;
                // this.tasksCount.completed = this.tasks.filter(task => task.type === 'task' && task.completed).length;
                // this.tasksCount.incomplete = this.tasksCount.total - this.tasksCount.completed;

                // Mark for check
                this._changeDetectorRef.markForCheck();

                // Update the count on the navigation
                setTimeout(() => {
                    // Get the component -> navigation data -> item
                    const mainNavigationComponent =
                        this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(
                            'mainNavigation'
                        );

                    // If the main navigation component exists...
                    if (mainNavigationComponent) {
                        // const mainNavigation = mainNavigationComponent.navigation;
                        // const menuItem = this._fuseNavigationService.getItem('apps.tasks', mainNavigation);

                        // Update the subtitle of the item
                        // menuItem.subtitle = this.tasksCount.incomplete + ' remaining tasks';

                        // Refresh the navigation
                        mainNavigationComponent.refresh();
                    }
                });
            });
        this._tasksService.question$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((task: Question) => {
                this.selectedQuestion = task;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this._tasksService.questions$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((task: Question[]) => {
                this.questions = task;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        // Get the task
        this._tasksService.task$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((task: Sections) => {
                this.selectedTask = task;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to media query change
        this._fuseMediaWatcherService
            .onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) => {
                // Calculate the drawer mode
                this.drawerMode = state.matches ? 'side' : 'over';

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Listen for shortcuts
        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(
                    (event) =>
                        (event.ctrlKey === true || event.metaKey) && // Ctrl or Cmd
                        (event.key === '/' || event.key === '.') // '/' or '.' key
                )
            )
            .subscribe((event: KeyboardEvent) => {
                // If the '/' pressed
                if (event.key === '/') {
                    this.createQuestion();
                }

                // If the '.' pressed
                if (event.key === '.') {
                    this.createTask();
                }
            });
        this.tasks.forEach((task: Sections) => {
            task.questions.forEach((question: Question, index) => {
                question.questions_order = index ;
                this._tasksService.updateQuestion(question).subscribe();
            });
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
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create task
     *
     * @param type
     */
    createTask(): void {
        // Create the task
        this._tasksService.createTask().subscribe((newTask) => {
            // Go to the new task
            this._router.navigate(['./', newTask.section_id], {
                relativeTo: this._activatedRoute,
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }
    createQuestion(): void {
        // Create the task
        this._tasksService.createQuestion().subscribe((newTask) => {
            // Go to the new task
            this._router.navigate(['./question/', newTask.id_question], {
                relativeTo: this._activatedRoute,
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Toggle the completed status
     * of the given task
     *
     * @param task
     */
    toggleCompleted(task: Sections): void {
        // Toggle the completed status
        // task.completed = !task.completed;

        // Update the task on the server
        this._tasksService.updateTask(task).subscribe();

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Task dropped
     *
     * @param event
     */
    dropped(event: CdkDragDrop<Sections[]>): void {
        // Move the item in the array
        moveItemInArray(
            event.container.data,
            event.previousIndex,
            event.currentIndex
        );

        // Save the new order
        this._tasksService.updateTasksOrders(event.container.data).subscribe();

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
}
