import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApexOptions } from 'ng-apexcharts';
import { ProjectService } from 'app/modules/studentComponents/dashboards/project/project.service';
import { UserService } from 'app/core/user/user.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { SolanaServicesService } from 'app/modules/admin/solana-services/solana-services.service';
import { MatDialog } from '@angular/material/dialog';
import { MailboxComposeComponent } from '../compose/compose.component';

@Component({
    selector: 'project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss'],
})
export class ProjectComponent implements OnInit, OnDestroy {
    filters: {
        hideCompleted$: BehaviorSubject<boolean>;
    } = {
        hideCompleted$: new BehaviorSubject(false),
    };
    teachers: any = [];
    ros: any;
    filtredTichers: any;
    framingData: any = [];
    user: any;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _solanaService: SolanaServicesService,
        private _projectService: ProjectService,
        private _router: Router,
        private _matDialog: MatDialog,
        private _userService: UserService
    ) {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                this.user = data;
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the data
        if (localStorage.getItem('cretaire') != 'ok') {
            this._matDialog.open(MailboxComposeComponent, {
                data: 'beforeRating',
            });
        }
        this._projectService.framing$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                console.log(data);
                this.framingData = data;
                this.framingData
                    .filter((t) => t.ratting != null)
                    .map((t) => (t['beforeRate'] = true));
            });

        this._projectService.teachers$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                console.log(data);
                this.teachers = data;
                this.teachers
                    .filter((t) => t.ratting != null)
                    .map((t) => (t['beforeRate'] = true));
            });
        this._projectService.ros$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                this.ros = data;

                this.ros
                    .filter((t) => t.value != null)
                    .map((t) => (t['beforeRate'] = true));
            });

        combineLatest([this.filters.hideCompleted$]).subscribe(
            ([hideCompleted]) => {
                // Reset the filtered courses
                this.filtredTichers = this.teachers;

                // Filter by category
                // Filter by completed
                if (hideCompleted) {
                    this.filtredTichers = this.filtredTichers.filter(
                        (course) => course.ratting == null
                    );
                }
            }
        );
    }
    confirmFraming(member) {
        let q = localStorage.getItem('publicKeywallet');
        if (!q || q === '') {
            this._matDialog.open(MailboxComposeComponent, {
                data: '',
            });
        } else {
            let rate = {
                value: member.ratting,
                teacher_rated_id: member.id,
                student_ratting_id: this.user.id,
            };
            this._projectService.rateFramer(rate).subscribe((data) => {
                this.framingData.filter((teacher) => {
                    if (teacher.id == member.id) {
                        teacher['confirmRate'] = false;
                        teacher['beforeRate'] = true;
                    }
                });
            });
        }
    }

    onRateFraming(member) {
        this.framingData.filter((teacher) => {
            if (teacher.id == member.id) {
                teacher['confirmRate'] = true;
            }
        });
    }
    cancelRateFraming(member) {
        this.framingData.filter((teacher) => {
            if (teacher.id == member.id) {
                teacher.ratting = null;
                teacher['confirmRate'] = false;
            }
        });
    }
    onRate(member) {
        this.filtredTichers.filter((teacher) => {
            if (teacher.id == member.id) {
                teacher['confirmRate'] = true;
            }
        });
    }
    onRateRo(member) {
        this.ros.filter((teacher) => {
            if (teacher.id == member.id) {
                teacher['confirmRate'] = true;
            }
        });
    }
    confirmRateRo(member) {
        let q = localStorage.getItem('publicKeywallet');
        if (!q || q === '') {
            this._matDialog.open(MailboxComposeComponent, {
                data: '',
            });
        }
        {
            if (member.value != null) {
                let rate = {
                    value: member.value,
                    teacher_ratting_id: member.id,
                    student_ratting_id: this.user.id,
                };
                this._projectService.rateRo(rate).subscribe(async (data) => {
                    this.ros.filter((teacher) => {
                        if (teacher.id == member.id) {
                            teacher['confirmRate'] = false;
                            teacher['beforeRate'] = true;
                        }
                    });
                    if (data) {
                        await this._solanaService.sendToken();
                    }
                });
            }
        }
    }
    cancelRateRo(member) {
        this.ros.filter((teacher) => {
            if (teacher.id == member.id) {
                teacher.value = null;
                teacher['confirmRate'] = false;
            }
        });
    }

    confirmRateTeaching(member) {
        let q = localStorage.getItem('publicKeywallet');
        if (!q || q === '') {
            this._matDialog.open(MailboxComposeComponent, {
                data: '',
            });
        } else {
            if (member.ratting != null) {
                let rate = {
                    value: member.ratting,
                    teacher_ratting_id: member.id,
                    student_ratting_id: this.user.id,
                    classroom_id: this.user.student_class,
                };
                this._projectService
                    .rateTeacher(rate)
                    .subscribe(async (data) => {
                        this.filtredTichers.filter((teacher) => {
                            if (teacher.id == member.id) {
                                teacher['confirmRate'] = false;
                                teacher['beforeRate'] = true;
                            }
                        });
                        if (data) {
                            await this._solanaService.sendToken();
                        }
                    });
            }
        }
    }
    cancelRateTeaching(member) {
        this.filtredTichers.filter((teacher) => {
            if (teacher.id == member.id) {
                teacher.ratting = null;
                teacher['confirmRate'] = false;
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
    toggleCompleted(change: MatSlideToggleChange): void {
        this.filters.hideCompleted$.next(change.checked);
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
}
