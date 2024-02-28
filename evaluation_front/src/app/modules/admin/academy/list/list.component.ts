import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AcademyService } from 'app/modules/admin/academy/academy.service';
import { Classroom, UeModules } from 'app/modules/admin/academy/academy.types';
import { MatDialog } from '@angular/material/dialog';
import { MailboxComposeComponent } from '../compose/compose.component';
import { MailboxComposeComponentUE } from '../UE/compose.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'academy-list',
    templateUrl: './list.component.html',
})
export class AcademyListComponent implements OnInit, OnDestroy {
    categories: Classroom[];
    courses: any[];
    filteredCourses: any[];
    filters: {
        categorySlug$: BehaviorSubject<string>;
        query$: BehaviorSubject<string>;
        queryClass$: BehaviorSubject<string>;
        index$: BehaviorSubject<string>;
    } = {
        categorySlug$: new BehaviorSubject('all'),
        query$: new BehaviorSubject(''),
        queryClass$: new BehaviorSubject(''),
        index$: new BehaviorSubject(''),
    };
    configForm: FormGroup;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    ratelaunch = true;

    /**
     * Constructor
     */
    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _matDialog: MatDialog,
        private _academyService: AcademyService
    ) {}
    addModule() {
        this._matDialog.open(MailboxComposeComponent, {
            data: '',
        });
    }
    addUE() {
        this._matDialog.open(MailboxComposeComponentUE, {
            data: '',
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.configForm = this._formBuilder.group({
            title: 'launch rate',
            message:
                'Are you sure you want to launch  this class rate? <span class="font-medium">This action cannot be undone!</span>',
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
        // Get the categories
        this._academyService.categories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categories: Classroom[]) => {
                this.categories = categories;
                // Mark for check
            });

        // Get the courses
        this._academyService.coursesUeClassroom$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((courses: any[]) => {
                this.courses = courses;
                this.filteredCourses = courses;

                // Mark for check
            });

        // Filter the courses
        combineLatest([
            this.filters.categorySlug$,
            this.filters.query$,
            this.filters.index$,
            this.filters.queryClass$,
        ]).subscribe(([categorySlug, query, index, queryClass]) => {
            // Reset the filtered courses
            this.filteredCourses = this.courses;

            // Filter by category
            if (categorySlug !== 'all') {
                this.filteredCourses = this.filteredCourses.filter(
                    (course) => course.class === categorySlug
                );
            }

            // Filter by search query
            if (query !== '') {
                this.filteredCourses = this.filteredCourses.filter((course) =>
                    course.class.toLowerCase().includes(query.toLowerCase())
                );
            }
            if (index !== '' && queryClass !== '') {
                if (queryClass !== '') {
                    this.filteredCourses[index].classRooms =
                        this.filteredCourses[index].classRooms.filter(
                            (course) =>
                                course.classroom
                                    .toLowerCase()
                                    .includes(queryClass.toLowerCase())
                        );
                }
            }
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
     * Filter by search query
     *
     * @param query
     */
    filterByQuery(query: string): void {
        this.filters.query$.next(query);
    }
    filterByQueryIndex(index, query: string): void {
        this.filters.queryClass$.next(query);
        this.filters.index$.next(index);
        this.ngOnInit();
    }

    /**
     * Filter by category
     *
     * @param change
     */
    filterByCategory(change: MatSelectChange): void {
        this.filters.categorySlug$.next(change.value);
    }
    launchRate(classRooms: any): void {
        // Open the dialog and save the reference of it
        const dialogRef = this._fuseConfirmationService.open(
            this.configForm.value
        );

        //  // Subscribe to afterClosed from the dialog reference
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                this._academyService.launchRate(classRooms).subscribe();
            }
        });
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
