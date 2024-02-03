import {
    ApplicationRef,
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
import {
    ActivatedRoute,
    ActivatedRouteSnapshot,
    Router,
} from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ContactsListComponent } from 'app/modules/admin/students/list/list.component';
import { ContactsService } from 'app/modules/admin/students/contacts.service';

@Component({
    selector: 'contacts-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
})
export class ContactsDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;

    editMode: boolean = false;
    tagsEditMode: boolean = false;
    contact: any;
    contactForm: FormGroup;
    contacts: any[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    classRooms: any[];
    modules: any[];
    tabelColumns: string[] = ['classroom', 'module_name', 'actions'];
    framingId: number = null;
    addButton: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _contactsListComponent: ContactsListComponent,
        private _contactsService: ContactsService,
        private _formBuilder: FormBuilder,
        private _router: Router
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this._contactsListComponent.matDrawer.open();
        // Create the contact form
        this.contactForm = this._formBuilder.group({
            id: [''],
            avatar: [null],
            first_name: ['', [Validators.required]],
            last_name: ['', [Validators.required]],
            email: [''],
            phone: [''],
            up: [''],
            company: [''],
            birthday: [null],
            address: [null],
            notes: [null],
        });
        // Get the contacts
        this._contactsService.classRooms$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: any[]) => {
                this.classRooms = contacts;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        // Get the contacts
        this._contactsService.contacts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: any[]) => {
                this.contacts = contacts;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the contact
        this._contactsService.contact$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contact: any) => {
                // Open the drawer in case it is closed
                this._contactsListComponent.matDrawer.open();

                // Get the contact
                this.contact = contact;
                if (this.contact.framer != null) {
                    this.framingId = this.contact.framer.id;
                }

                // Patch values to the form
                this.contactForm.patchValue(contact);

                // Toggle the edit mode off
                this.toggleEditMode(false);

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

        // Dispose the overlays if they are still on the DOM
        if (this._tagsPanelOverlayRef) {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    changeClassRoom($event) {
        this.framingId = $event.value;
        if (this.framingId != null) {
            this.addButton = true;
        }
    }

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._contactsListComponent.matDrawer.close();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        } else {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Update the contact
     */
    updateContact(): void {
        if (this.contactForm.dirty && this.contactForm.valid) {
            // Get the contact object
            const contact = this.contactForm.getRawValue();

            // Update the contact on the server
            this._contactsService
                .updateContact(contact.id, contact)
                .subscribe(() => {
                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                });
        }
    }

    /**
     * Delete the contact
     */
    deleteContact(): void {
        // Get the current contact's id
        const id = this.contact.id;

        // Get the next/previous contact's id
        const currentContactIndex = this.contacts.findIndex(
            (item) => item.id === id
        );
        const nextContactIndex =
            currentContactIndex +
            (currentContactIndex === this.contacts.length - 1 ? -1 : 1);
        const nextContactId =
            this.contacts.length === 1 && this.contacts[0].id === id
                ? null
                : this.contacts[nextContactIndex].id;

        // Delete the contact
        this._contactsService.deleteContact(id).subscribe((isDeleted) => {
            // Return if the contact wasn't deleted...
            if (!isDeleted) {
                return;
            }

            // Navigate to the next contact if available
            if (nextContactId) {
                this._router.navigate(['../', nextContactId], {
                    relativeTo: this._activatedRoute,
                });
            }
            // Otherwise, navigate to the parent
            else {
                this._router.navigate(['../'], {
                    relativeTo: this._activatedRoute,
                });
            }

            // Toggle the edit mode off
            this.toggleEditMode(false);
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Upload avatar
     *
     * @param fileList
     */
    uploadAvatar(fileList: FileList): void {
        // Return if canceled
        if (!fileList.length) {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png'];
        const file = fileList[0];

        // Return if the file is not allowed
        if (!allowedTypes.includes(file.type)) {
            return;
        }

        // Upload the avatar
        // this._contactsService.uplodAvatar(this.contact.id, file).subscribe();
    }

    /**
     * Remove the avatar
     */
    removeAvatar(): void {
        // Get the form control for 'avatar'
        const avatarFormControl = this.contactForm.get('avatar');

        // Set the avatar as null
        avatarFormControl.setValue(null);

        // Set the file input value as null
        this._avatarFileInput.nativeElement.value = null;

        // Update the contact
        this.contact.avatar = null;
    }

    /**
     * Toggle the tags edit mode
     */
    toggleTagsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode;
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

    affectationFramer(user) {
        this._contactsService
            .affectationSuperVisor(this.framingId, user.id)
            .subscribe((res) => {
                this.editMode = true;
                this.framingId = res.framing;
                this.addButton = false;
                this.contact = res;
            });
    }
}
