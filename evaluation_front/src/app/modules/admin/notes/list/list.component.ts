import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NotesLabelsComponent } from 'app/modules/admin/notes/labels/labels.component';
import { NotesService } from 'app/modules/admin/notes/notes.service';
import { Label, Note } from 'app/modules/admin/notes/notes.types';
import { cloneDeep } from 'lodash-es';
import { OrgData } from 'angular-org-chart/src/app/modules/org-chart/orgData';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'notes-list',
    templateUrl: './list.component.html',
})
export class NotesListComponent implements OnInit, OnDestroy {
    labels$: Observable<Label[]>;
    notes$: Observable<Note[]>;
    data: any[];
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    filter$: BehaviorSubject<string> = new BehaviorSubject('notes');
    searchQuery$: BehaviorSubject<string> = new BehaviorSubject(null);
    masonryColumns: number = 4;
    orgData: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    configForm: FormGroup;

    /**
     * Constructor
     */
    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _matDialog: MatDialog,
        private _notesService: NotesService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the filter status
     */
    get filterStatus(): string {
        return this.filter$.value;
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
                'Are you sure you want to launch  this Uo rate? <span class="font-medium">This action cannot be undone!</span>',
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
        // Request the data from the server
        this._notesService.getLabels().subscribe((data) => {
            this.filterByLabel(data[0].up_id);

            this._notesService.getNotes(data[0].name_up).subscribe((notes) => {
                this.orgData = notes;
            });
        });

        // Get labels
        this.labels$ = this._notesService.labels$;

        // Get notes
        this.notes$ = combineLatest([
            this._notesService.notes$,
            this.filter$,
            this.searchQuery$,
        ]).pipe(
            distinctUntilChanged(),
            map(([notes, filter, searchQuery]) => {
                if (!notes || !notes.length) {
                    return;
                }

                // Store the filtered notes
                let filteredNotes = notes;

                // Filter by query
                if (searchQuery) {
                    searchQuery = searchQuery.trim().toLowerCase();
                    filteredNotes = filteredNotes.filter(
                        (note) =>
                            note.title.toLowerCase().includes(searchQuery) ||
                            note.content.toLowerCase().includes(searchQuery)
                    );
                }

                // Show all
                if (filter === 'notes') {
                    // Do nothing
                }

                // Show archive
                const isArchive = filter === 'archived';
                filteredNotes = filteredNotes.filter(
                    (note) => note.archived === isArchive
                );

                // Filter by label
                if (filter.startsWith('label:')) {
                    const labelId = filter.split(':')[1];
                    filteredNotes = filteredNotes.filter(
                        (note) =>
                            !!note.labels.find((item) => item.up_id === labelId)
                    );
                }

                return filteredNotes;
            })
        );

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Set the drawerMode and drawerOpened if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                } else {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Set the masonry columns
                //
                // This if block structured in a way so that only the
                // biggest matching alias will be used to set the column
                // count.
                if (matchingAliases.includes('xl')) {
                    this.masonryColumns = 5;
                } else if (matchingAliases.includes('lg')) {
                    this.masonryColumns = 4;
                } else if (matchingAliases.includes('md')) {
                    this.masonryColumns = 3;
                } else if (matchingAliases.includes('sm')) {
                    this.masonryColumns = 2;
                } else {
                    this.masonryColumns = 1;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
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
     * Add a new note
     */
    addNewNote(): void {
        // add rate launch
        const dialogRef = this._fuseConfirmationService.open(
            this.configForm.value
        );
    }

    /**
     * Open the edit labels dialog
     */
    openEditLabelsDialog(): void {
        this._matDialog.open(NotesLabelsComponent, { autoFocus: false });
    }

    /**
     * Filter by archived
     */
    filterByArchived(): void {
        this.filter$.next('archived');
    }

    /**
     * Filter by label
     *
     * @param labelId
     */
    filterByLabel(labelId: string): void {
        const filterValue = `label:${labelId}`;
        this.filter$.next(filterValue);
    }

    /**
     * Filter by query
     *
     * @param query
     */
    filterByQuery(query: string): void {
        this.searchQuery$.next(query);
    }

    /**
     * Reset filter
     */
    resetFilter(): void {
        this.filter$.next(this.labels$[0].up_id);
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
