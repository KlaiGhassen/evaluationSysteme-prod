import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApexOptions } from 'ng-apexcharts';
import { ProjectService } from 'app/modules/admin/dashboards/project/project.service';
import { UserService } from 'app/core/user/user.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss'],
})
export class ProjectComponent implements OnInit, OnDestroy {
    chartGithubIssues: any = {};
    filters: {
        hideCompleted$: BehaviorSubject<boolean>;
    } = {
        hideCompleted$: new BehaviorSubject(false),
    };

    data: any;
    user;
    framingData = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    teachers: any;
    filtredTichers: any;
    dataTeaching: any;
    selectedFilter = 'Teaching';
    tabelColumns: string[] = [
        'name_class',
        'num_students',
        'num_students_rated',
        'name_module',
        'university_year',
    ];
    configForm: FormGroup;
    ratings;

    charLabels = ['1 star', '2 stars', '3 stars', '4 stars', '5 stars'];
    series = [];
    studentsNumber;

    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _projectService: ProjectService,
        private _router: Router,
        private _userService: UserService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService
    ) {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                console.log('connected user', data);
                this.user = data;
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    claimResult() {
        this.configForm = this._formBuilder.group({
            title: 'Confirm Reclamations',
            message: 'Are you sure you want to confirm this reclamation ?',
            icon: this._formBuilder.group({
                show: true,
                name: 'heroicons_outline:exclamation',
                color: 'warn',
            }),
            actions: this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show: true,
                    label: 'confirm',
                    color: 'warn',
                }),
                cancel: this._formBuilder.group({
                    show: true,
                    label: 'Cancel',
                }),
            }),
            dismissible: true,
        });
        const dialogRef = this._fuseConfirmationService.open(
            this.configForm.value
        );
        dialogRef.beforeClosed().subscribe((result) => {
            if (result == 'confirmed') {
                this._projectService.reclaim().subscribe((data) => {
                    this.user = data;
                    this._changeDetectorRef.markForCheck();
                });
            }
        });
    }
    isNumber(o): boolean {
        return !isNaN(o - 0) && o !== null && o !== '' && o !== false;
    }
    ngOnInit(): void {
        this._projectService.studentsNumber$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                this.studentsNumber = data;
            });
        this._prepareChartData();

        this._projectService.chartStudents$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data: any) => {
                console.log('data to check ', data);
                this.ratings = data;
                this._changeDetectorRef.markForCheck();
            });
        this._projectService.teachers$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                this.teachers = data;
                this.teachers
                    .filter((t) => t.value != null)
                    .map((t) => (t['beforeRate'] = true));
            });

        combineLatest([this.filters.hideCompleted$]).subscribe(
            ([hideCompleted]) => {
                // Reset the filtered courses
                this.filtredTichers = this.teachers;
                console.log('filtred teachers', this.filtredTichers);
                // Filter by completed
                if (hideCompleted) {
                    this.filtredTichers = this.filtredTichers.filter(
                        (course) => course.value == null
                    );
                }
            }
        );

        this._projectService.dataTeaching$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                this.dataTeaching = data;
            });
        this._projectService.dataFraming$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                this.framingData = data;
            });

        // Get the data
        this._projectService.data$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                console.log('the data ', data);
                // Store the data
                this.data = data;

                // Prepare the chart data
                this._prepareChartData();
            });

        // Attach SVG fill fixer to all ApexCharts
        window['Apex'] = {
            chart: {
                events: {
                    mounted: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                    updated: (chart: any, options?: any): void => {
                        this._fixSvgFill(chart.el);
                    },
                },
            },
        };

        // Filter the courses
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
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Fix the SVG fill references. This fix must be applied to all ApexCharts
     * charts in order to fix 'black color on gradient fills on certain browsers'
     * issue caused by the '<base>' tag.
     *
     * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
     *
     * @param element
     * @private
     */
    private _fixSvgFill(element: Element): void {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
            .filter((el) => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) => {
                const attrVal = el.getAttribute('fill');
                el.setAttribute(
                    'fill',
                    `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`
                );
            });
    }

    onRate(member) {
        this.filtredTichers.filter((teacher) => {
            if (teacher.id == member.id) {
                teacher['confirmRate'] = true;
            }
        });
    }
    confirmRateTeaching(member) {
        console.log(member);
        if (this.user.role != 'RDI') {
            if (member.value != null) {
                let rate = {
                    value: member.value,
                    teacher_rated_id: member.id,
                    teacher_rate_id: this.user.id,
                    type: this.user.role,
                };
                this._projectService.rateTeacher(rate).subscribe((data) => {
                    this.filtredTichers.filter((teacher) => {
                        if (teacher.id == member.id) {
                            teacher['confirmRate'] = false;
                            teacher['beforeRate'] = true;
                        }
                    });
                });
                combineLatest([this.filters.hideCompleted$]).subscribe(
                    ([hideCompleted]) => {
                        // Reset the filtered courses
                        this.filtredTichers = this.teachers;

                        // Filter by completed
                        if (hideCompleted) {
                            this.filtredTichers = this.filtredTichers.filter(
                                (course) => course.value == null
                            );
                        }
                    }
                );
            }
        } else {
            if (member.rdi_affectation == true) {
                if (member.value != null) {
                    let rate = {
                        value: member.value,
                        teacher_rated_id: member.id,
                        teacher_rate_id: this.user.id,
                        type: this.user.role,
                    };
                    this._projectService.rateTeacher(rate).subscribe((data) => {
                        this.filtredTichers.filter((teacher) => {
                            if (teacher.id == member.id) {
                                teacher['confirmRate'] = false;
                                teacher['beforeRate'] = true;
                            }
                        });
                    });
                    combineLatest([this.filters.hideCompleted$]).subscribe(
                        ([hideCompleted]) => {
                            // Reset the filtered courses
                            this.filtredTichers = this.teachers;

                            // Filter by completed
                            if (hideCompleted) {
                                this.filtredTichers =
                                    this.filtredTichers.filter(
                                        (course) => course.value == null
                                    );
                            }
                        }
                    );
                }
            } else {
                if (member.value != null) {
                    let rate = {
                        value: member.value,
                        teacher_rated_id: member.id,
                        teacher_rate_id: this.user.id,
                        type: 'TEACHER',
                    };
                    this._projectService.rateTeacher(rate).subscribe((data) => {
                        this.filtredTichers.filter((teacher) => {
                            if (teacher.id == member.id) {
                                teacher['confirmRate'] = false;
                                teacher['beforeRate'] = true;
                            }
                        });
                    });
                    combineLatest([this.filters.hideCompleted$]).subscribe(
                        ([hideCompleted]) => {
                            // Reset the filtered courses
                            this.filtredTichers = this.teachers;

                            // Filter by completed
                            if (hideCompleted) {
                                this.filtredTichers =
                                    this.filtredTichers.filter(
                                        (course) => course.value == null
                                    );
                            }
                        }
                    );
                }
            }
        }
    }
    cancelRateTeaching(member) {
        console.log('hello');
        this.filtredTichers.filter((teacher) => {
            if (teacher.id == member.id) {
                teacher.ratting = null;
                teacher.value = null;
                teacher['beforeRate'] = false;
            }
        });
    }

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
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
                followCursor: false,
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
    }

    toggleCompleted(change: MatSlideToggleChange): void {
        this.filters.hideCompleted$.next(change.checked);
    }
}
