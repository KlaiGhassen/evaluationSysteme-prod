import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, map, switchMap, takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import {
    InventoryBrand,
    InventoryCategory,
    InventoryPagination,
    InventoryProduct,
    InventoryTag,
    InventoryVendor,
} from 'app/modules/admin/ecommerce/inventory/inventory.types';
import { InventoryService } from 'app/modules/admin/ecommerce/inventory/inventory.service';
import { MatDialog } from '@angular/material/dialog';
import { MailboxComposeComponent } from '../compose/compose.component';
import { ContactsService } from 'app/modules/admin/students/contacts.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'inventory-list',
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.scss'],
    animations: fuseAnimations,
})
export class InventoryListComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    products$: Observable<any[]>;
    classRoomId: any = 'all';
    classRooms: any;
    brands: InventoryBrand[];
    categories: InventoryCategory[];
    filteredTags: InventoryTag[];
    flashMessage: 'success' | 'error' | null = null;
    isLoading: boolean = false;
    pagination: InventoryPagination;
    searchInputControl: FormControl = new FormControl();
    selectedProduct: InventoryProduct | null = null;
    selectedProductForm: FormGroup;
    tags: InventoryTag[];
    tagsEditMode: boolean = false;
    vendors: InventoryVendor[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user;
    /**
     * Constructor
     */
    constructor(
        private _matDialog: MatDialog,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _inventoryService: InventoryService,
        private _userService: UserService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: any) => {
                this.user = user;
            });
        // Get the pagination
        this._inventoryService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: InventoryPagination) => {
                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this._inventoryService.classRooms$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: any[]) => {
                this.classRooms = contacts;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the products
        this.products$ = this._inventoryService.products$;

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    if (query.length > 0) {
                        this.classRoomId = 'all';
                    }
                    this.isLoading = true;

                    return this._inventoryService.getProducts(
                        this.classRoomId,
                        0,
                        10,
                        'first_name',
                        'asc',
                        query
                    );
                }),
                map(() => {
                    this.products$ = this._inventoryService.products$;
                    this.isLoading = false;
                })
            )
            .subscribe();
    }
    changeClassRoom($event) {
        this.searchInputControl.setValue('');
        this.classRoomId = $event.value;
        this.isLoading = true;
        this._inventoryService
            .getProducts($event.value, 0, 10, 'first_name', 'asc')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.products$ = this._inventoryService.products$;
                this.isLoading = false;
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            // Set the initial sort
            this._sort.sort({
                id: 'first_name',
                start: 'asc',
                disableClear: true,
            });
            // Mark for check
            this._changeDetectorRef.markForCheck();
            // If the user changes the sort order...
            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    // Reset back to the first page
                    this._paginator.pageIndex = 0;
                    // Close the details
                });
            // Get products if sort or page changes
            merge(this._sort.sortChange, this._paginator.page)
                .pipe(
                    switchMap(() => {
                        this.isLoading = true;
                        return this._inventoryService.getProducts(
                            this.classRoomId,
                            this._paginator.pageIndex,
                            this._paginator.pageSize,
                            this._sort.active,
                            this._sort.direction
                        );
                    }),
                    map(() => {
                        this.products$ = this._inventoryService.products$;
                        this.isLoading = false;
                    })
                )
                .subscribe();
        }
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
     * Create product
     */
    createProduct(): void {
        this._matDialog.open(MailboxComposeComponent, {
            data: '',
        });
    }
    openDetail(student): void {
        this._matDialog.open(MailboxComposeComponent, {
            data: { student: student, isTransaction: false },
        });
    }
    transaction(student): void {
        this._matDialog.open(MailboxComposeComponent, {
            data: { student: student, isTransaction: true },
        });
    }

    /**
     * Show flash message
     */
    showFlashMessage(type: 'success' | 'error'): void {
        // Show the message
        this.flashMessage = type;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Hide it after 3 seconds
        setTimeout(() => {
            this.flashMessage = null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
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
