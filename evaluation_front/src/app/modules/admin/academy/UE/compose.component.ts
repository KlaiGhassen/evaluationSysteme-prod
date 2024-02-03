import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { AcademyService } from '../academy.service';
import { takeUntil } from 'rxjs/operators';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatSelectChange } from '@angular/material/select';

@Component({
    selector: 'mailbox-compose',
    templateUrl: './compose.component.html',
})
export class MailboxComposeComponentUE implements OnInit {
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    userForm: FormGroup;
    searchInputControl: FormControl = new FormControl();
    filteredTags: any[];
    tags: any[];
    addedTags: any[] = [];
    categories: any[];
    listUe = [];
    tagsEditMode: boolean = false;
    listRo = [];

    private _tagsPanelOverlayRef: OverlayRef;
    filters: {
        categorySlug$: BehaviorSubject<string>;
    } = {
        categorySlug$: new BehaviorSubject('all'),
    };
    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<MailboxComposeComponentUE>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _formBuilder: FormBuilder,
        private _academyService: AcademyService,
        private _overlay: Overlay,
        private _changeDetectorRef: ChangeDetectorRef,
        private _viewContainerRef: ViewContainerRef
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._academyService.categories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categories: any[]) => {
                this.categories = categories;
                // Mark for check
            });
        // Get the tags

        this._academyService.courses$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((listUe: any[]) => {
                this.listUe = listUe;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._academyService.ro$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((ro: any[]) => {
                this.listRo = ro;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._academyService.tags$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tags: any[]) => {
                this.tags = tags;
                this.filteredTags = tags;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this.userForm = this._formBuilder.group({
            name_ue: ['', Validators.required],

            class: ['', Validators.required],
            Description: [''],
        });
        // Filter the courses
        combineLatest([this.filters.categorySlug$]).subscribe(
            ([categorySlug]) => {
                // Reset the filtered courses
                this.filteredTags = this.tags;

                // Filter by category
                if (categorySlug !== 'all') {
                    this.filteredTags = this.filteredTags.filter(
                        (classroom) => classroom.class === categorySlug
                    );
                }
            }
        );
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        if (this._tagsPanelOverlayRef) {
            this._tagsPanelOverlayRef.dispose();
        }
    }
    /**
     * Discard the message
     */
    discard(): void {
        this.matDialogRef.close();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item._id || index;
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

        // If there is a tag...
        const tag = this.filteredTags[0];
        const isTagApplied = this.addedTags.find(
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
     * Toggle task tag
     *
     * @param tag
     */
    toggleTaskTag(tag: any): void {
        if (this.addedTags.includes(tag.classroom_id)) {
            this.deleteTagFromTask(tag);
        } else {
            this.addTagToTask(tag);
        }
    }

    addTagToTask(tag: any): void {
        // Add the tag
        this.addedTags.unshift(tag.classroom_id);
        // Update the task form
        this.userForm.get('classRooms').patchValue(this.addedTags);
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Delete tag from the task
     *
     * @param tag
     */
    deleteTagFromTask(tag: any): void {
        // Remove the tag
        this.addedTags.splice(
            this.addedTags.findIndex((item) => item === tag.classroom_id),
            1
        );

        // Update the task form
        this.userForm.get('classRooms').patchValue(this.addedTags);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Filter by category
     *
     * @param change
     */
    filterByCategory(change: MatSelectChange): void {
        this.filters.categorySlug$.next(change.value);
    }

    // add module
    addUe(): void {
        if (this.userForm.valid) {
            this._academyService
                .createUe(this.userForm.value)
                .subscribe((res) => {
                    this.matDialogRef.close();
                });
        }
    }
}
