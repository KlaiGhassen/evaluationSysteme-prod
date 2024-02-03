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
import { ContactsListComponent } from 'app/modules/admin/teachers/list/list.component';
import { ContactsService } from 'app/modules/admin/teachers/contacts.service';
import { ProjectService } from '../../dashboards/project/project.service';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'contacts-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
})
export class ContactsDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;
    selectedFilter = 'Teaching';
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
    tableColumnrating: string[] = ['nameTeacher', 'value', 'actions'];

    classRoomId: number = null;
    classRoomIdSuperVising: number = null;
    moduleId: number = null;
    addButton: boolean = false;
    classRoomSelect = false;
    charLabels = ['1 star', '2 stars', '3 stars', '4 stars', '5 stars'];
    series = [];
    dataFraming = [];
    connectedUser;
    supervisingClassRooms: any[] = [];
    filterChart = [
        { nameFilter: 'Teaching', role: 'all' },
        { nameFilter: 'Rdi', role: 'all' },
        { nameFilter: 'Supervising', role: 'all' },
        { nameFilter: 'appreciation', role: 'all' },
    ];
    arrayOfTeachers = [];

    data: any;
    chartGithubIssues: any = {};
    moy: number = 0;
    allRates: number = 0;
    teachersRate: any[] = [];

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _contactsListComponent: ContactsListComponent,
        private _contactsService: ContactsService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _userService: UserService,
        private _projectService: ProjectService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this.series = [];
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                this.connectedUser = data;
            });

        this._contactsService.TeacherRate$.pipe(
            takeUntil(this._unsubscribeAll)
        ).subscribe((data: any[]) => {
            this.teachersRate = data;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        this._contactsListComponent.matDrawer.open();
        // Create the contact form
        this.contactForm = this._formBuilder.group({
            id: [''],
            image: [null],
            first_name: ['', [Validators.required]],
            last_name: ['', [Validators.required]],
            email: [''],
            phone: [''],
            up: [''],
            address: [null],
        });
        this._contactsService.modules$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: any[]) => {
                this.modules = contacts;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._prepareChartData();
        this.onFilterChange({ value: 'Teaching' });

        // Get the contacts
        this._contactsService.classRooms$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: any[]) => {
                this.classRooms = contacts;

                contacts.forEach((element) => {
                    if (element.name_class.startsWith('5')) {
                        this.supervisingClassRooms.push(element);
                    }
                });
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
        this._contactsService.framingStudents$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: any[]) => {
                this.dataFraming = contacts;
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
                console.log('data', contact);

                // Patch values to the form
                this.contactForm.patchValue(contact);

                // Toggle the edit mode off
                this.toggleEditMode(false);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        // Get the data
        // this._projectService.data$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((data) => {
        //         // Store the data
        //         this.data = data;
        //         // Prepare the chart data
        //         this._prepareChartData();
        //         this._changeDetectorRef.markForCheck();
        //     });
    }

    isNumber(o): boolean {
        return !isNaN(o - 0) && o !== null && o !== '' && o !== false;
    }
    onFilterChange(e) {
        switch (e.value) {
            case 'Teaching':
                this.series = [];
                this._prepareChartData();
                this._contactsService.chartStudents$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((data: any) => {
                        console.log('data', data);
                        if (data[4] == null || isNaN(data[4])) {
                            this.moy = 0;
                        }
                        this.moy = data[4];
                        console.log(data[5]);

                        this.allRates = data[5];
                        let teachingSeries = [0, 0, 0, 0, 0];
                        data[0].data.forEach((element) => {
                            switch (element.value) {
                                case 1:
                                    teachingSeries[0] = element.count;
                                    break;
                                case 2:
                                    teachingSeries[1] = element.count;
                                    break;
                                case 3:
                                    teachingSeries[2] = element.count;
                                    break;
                                case 4:
                                    teachingSeries[3] = element.count;
                                    break;
                                case 5:
                                    teachingSeries[4] = element.count;
                                    break;
                                default:
                                    break;
                            }
                        });

                        this.series = [
                            {
                                name: data[0].name,
                                type: 'line',
                                data: teachingSeries,
                            },
                            {
                                name: data[0].name,
                                type: 'column',
                                data: teachingSeries,
                            },
                        ];
                        this._prepareChartData();

                        this._changeDetectorRef.markForCheck();
                    });
                break;
            case 'Rdi':
                this.series = [];
                this._prepareChartData();

                this._contactsService.chartStudents$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((data: any) => {
                        if (data[4] == null || isNaN(data[4])) {
                            this.moy = 0;
                        }
                        this.moy = data[4];
                        this.allRates = data[5];

                        let teachingSeries = [0, 0, 0, 0, 0];
                        data[1].data.forEach((element) => {
                            switch (element.value) {
                                case 1:
                                    teachingSeries[0] = element.count;
                                    break;
                                case 2:
                                    teachingSeries[1] = element.count;
                                    break;
                                case 3:
                                    teachingSeries[2] = element.count;
                                    break;
                                case 4:
                                    teachingSeries[3] = element.count;
                                    break;
                                case 5:
                                    teachingSeries[4] = element.count;
                                    break;
                                default:
                                    break;
                            }
                        });

                        this.series = [
                            {
                                name: data[1].name,
                                type: 'line',
                                data: teachingSeries,
                            },
                            {
                                name: data[1].name,
                                type: 'column',
                                data: teachingSeries,
                            },
                        ];
                        this._prepareChartData();

                        this._changeDetectorRef.markForCheck();
                    });
                break;
            case 'Supervising':
                this.series = [];
                this._prepareChartData();

                this._contactsService.chartStudents$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((data: any) => {
                        if (data[4] == null || isNaN(data[4])) {
                            this.moy = 0;
                        }
                        this.moy = data[4];
                        this.allRates = data[5];

                        let teachingSeries = [0, 0, 0, 0, 0];
                        data[2].data.forEach((element) => {
                            switch (element.value) {
                                case 1:
                                    teachingSeries[0] = element.count;
                                    break;
                                case 2:
                                    teachingSeries[1] = element.count;
                                    break;
                                case 3:
                                    teachingSeries[2] = element.count;
                                    break;
                                case 4:
                                    teachingSeries[3] = element.count;
                                    break;
                                case 5:
                                    teachingSeries[4] = element.count;
                                    break;
                                default:
                                    break;
                            }
                        });

                        this.series = [
                            {
                                name: data[2].name,
                                type: 'line',
                                data: teachingSeries,
                            },
                            {
                                name: data[2].name,
                                type: 'column',
                                data: teachingSeries,
                            },
                        ];
                        this._prepareChartData();

                        this._changeDetectorRef.markForCheck();
                    });
                break;
            case 'appreciation':
                this.series = [];
                this._prepareChartData();

                this._contactsService.chartStudents$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((data: any) => {
                        if (data[4] == null || isNaN(data[4])) {
                            this.moy = 0;
                        }
                        this.moy = data[4];
                        this.allRates = data[5];

                        let teachingSeries = [0, 0, 0, 0, 0];
                        data[3].data.forEach((element) => {
                            switch (element.value) {
                                case 1:
                                    teachingSeries[0] = element.count;
                                    break;
                                case 2:
                                    teachingSeries[1] = element.count;
                                    break;
                                case 3:
                                    teachingSeries[2] = element.count;
                                    break;
                                case 4:
                                    teachingSeries[3] = element.count;
                                    break;
                                case 5:
                                    teachingSeries[4] = element.count;
                                    break;
                                default:
                                    break;
                            }
                        });

                        this.series = [
                            {
                                name: data[3].name,
                                type: 'line',
                                data: teachingSeries,
                            },
                            {
                                name: data[3].name,
                                type: 'column',
                                data: teachingSeries,
                            },
                        ];
                        this._prepareChartData();

                        this._changeDetectorRef.markForCheck();
                    });
                break;

            default:
                this.series = [];
                this._prepareChartData();

                this._contactsService.chartStudents$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((data: any) => {
                        if (data[4] == null || isNaN(data[4])) {
                            this.moy = 0;
                        }
                        this.moy = data[4];
                        this.allRates = data[5];

                        let teachingSeries = [0, 0, 0, 0, 0];
                        data[4].data.forEach((element) => {
                            switch (element.value) {
                                case 1:
                                    teachingSeries[0] = element.count;
                                    break;
                                case 2:
                                    teachingSeries[1] = element.count;
                                    break;
                                case 3:
                                    teachingSeries[2] = element.count;
                                    break;
                                case 4:
                                    teachingSeries[3] = element.count;
                                    break;
                                case 5:
                                    teachingSeries[4] = element.count;
                                    break;
                                default:
                                    break;
                            }
                        });

                        this.series = [
                            {
                                name: data[4].name,
                                type: 'line',
                                data: teachingSeries,
                            },
                            {
                                name: data[4].name,
                                type: 'column',
                                data: teachingSeries,
                            },
                        ];
                        // this.series = data;
                        this._prepareChartData();
                        this._changeDetectorRef.markForCheck();
                    });
                break;
        }
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
    changeModule($event) {
        this.moduleId = $event.value;
        if (this.classRoomId != null && this.moduleId != null) {
            this.addButton = true;
        }
    }
    disableModuleSelect = true;
    students: any[];
    studentId: any;
    changeStudentSuperVising($event) {
        this.addButtonSuperVising = true;
        this.studentId = $event.value;
    }
    changeClassRoomForSuperVising($event) {
        this._contactsService.getStudent($event.value).subscribe();
        this._contactsService.students$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: any[]) => {
                this.students = contacts;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    changeClassRoom($event) {
        this._contactsService.modules$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((contacts: any[]) => {
                this.modules = contacts;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this.classRoomId = $event.value;
        if (this.classRoomId != null && this.moduleId != null) {
            this.addButton = true;
        }
        let classRoomObject = this.classRooms.filter((classRoom) => {
            return classRoom.classroom_id == this.classRoomId;
        });
        if (classRoomObject[0]) {
            this.modules = this.modules.filter((module) => {
                return module.class === classRoomObject[0].class;
            });
        }
        this.disableModuleSelect = false;
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
        if (this.contactForm.valid && this.contactForm.dirty) {
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
    removeAffectation(user_id, module_id, classroom_id) {
        let affectation_id = {
            teacher_id: user_id,
            classroom: classroom_id,
            module: module_id,
        };

        this._contactsService
            .deleteAffectation(affectation_id)
            .subscribe((isDeleted) => {
                this._contactsService
                    .getContactById(user_id)
                    .subscribe((contact: any) => {
                        this.contact = contact;
                        this.classRoomId = null;
                        this.moduleId = null;
                        this.addButton = false;
                        this.editMode = true;
                    });
            });
    }
    addButtonSuperVising = false;
    deleteAssignmenet(user) {
        this._contactsService
            .affectationSuperVisor(user.id, null)
            .subscribe((res) => {
                this._contactsService.framingStudents$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((contacts: any[]) => {
                        this.dataFraming = contacts;
                        // Mark for check
                        this.addButtonSuperVising = false;

                        this._changeDetectorRef.markForCheck();
                    });
            });
    }

    affectationSuperVising(user) {
        this._contactsService
            .affectationSuperVisor(user.id, this.studentId)
            .subscribe((res) => {
                this.addButtonSuperVising = false;
            });
    }

    affectationClassRoomModule(user) {
        let affectation = {
            teacher_id: user.id,
            classroom: this.classRoomId,
            module: this.moduleId,
        };
        this._contactsService
            .affectationClassRoomModule(affectation)
            .subscribe((res) => {
                this._contactsService
                    .getContactById(user.id)
                    .subscribe((contact: any) => {
                        this.contact = contact;
                        this.classRoomId = null;
                        this.moduleId = null;
                        this.addButton = false;
                        this.editMode = true;
                    });
            });
    }
    private _prepareChartData(): void {
        // Github issues
        this.chartGithubIssues = {
            chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'line',
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false,
                },
            },
            colors: ['#64748B', '#94A3B8'],
            dataLabels: {
                enabled: true,
                enabledOnSeries: [0],
                background: {
                    borderWidth: 0,
                },
            },
            grid: {
                borderColor: 'var(--fuse-border)',
            },
            labels: this.charLabels,
            legend: {
                show: false,
            },
            plotOptions: {
                bar: {
                    columnWidth: '50%',
                },
            },
            series: this.series,
            states: {
                hover: {
                    filter: {
                        type: 'darken',
                        value: 0.75,
                    },
                },
            },
            stroke: {
                width: [3, 0],
            },
            tooltip: {
                followCursor: true,
                theme: 'dark',
            },
            xaxis: {
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    color: 'var(--fuse-border)',
                },
                labels: {
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
                tooltip: {
                    enabled: false,
                },
            },
            yaxis: {
                labels: {
                    offsetX: -16,
                    style: {
                        colors: 'var(--fuse-text-secondary)',
                    },
                },
            },
        };
        this._changeDetectorRef.markForCheck();
    }
}
