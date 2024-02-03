import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ContactsService } from '../contacts.service';
import { AcademyService } from '../../academy/academy.service';
import { takeUntil } from 'rxjs/operators';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import * as XLSX from 'xlsx';
import { forEach } from 'lodash';

@Component({
    selector: 'mailbox-compose',
    templateUrl: './compose.component.html',
})
export class MailboxComposeComponent implements OnInit {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    userForm: FormGroup;
    searchInputControl: FormControl = new FormControl();
    categories: any[];
    fromFile: boolean = false;
    files: File[] = [];
    dataStudents = [];
    public tableData: any;
    public tableTitle: any;
    public customPagination = 1;
    public recordsPerPage = 10;
    public tableRecords = [];
    public pageStartCount = 0;
    public pageEndCount = 10;
    public totalPageCount = 0;
    public currentPage = 0;
    progresDetail = 0;
    file = {
        type: 'XLS',
    };

    /**
     * Constructor
     */
    constructor(
        private _academyService: AcademyService,
        public matDialogRef: MatDialogRef<MailboxComposeComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _formBuilder: FormBuilder,
        private _contactsService: ContactsService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.userForm = this._formBuilder.group({
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            phone: ['', Validators.required],
            role: ['STUDENT'],
            email: ['', [Validators.required, Validators.email]],
            student_class: ['', Validators.required],
        });
        this._academyService.categories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categories: any[]) => {
                this.categories = categories;
                // Mark for check
            });
    }
    toggleCompleted(change: MatSlideToggleChange): void {
        this.fromFile = !this.fromFile;
        // this.filters.hideCompleted$.next(change.checked);
    }
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    /**
     * Discard the message
     */
    discard(): void {
        this.matDialogRef.close();
    }

    onRemove(event: any) {
        this.files.splice(this.files.indexOf(event), 1);
        this.dataStudents = [];
        this.progresDetail = 0;
    }
    onSelect(event: any) {
        if (this.files.length > 0) {
            this.files = [];
        }

        this.files.push(...event.addedFiles);
    }
    public uploadData(e) {
        if (this.files.length > 0) {
            this.files = [];
        }

        this.files.push(...e.addedFiles);

        /* wire up file reader */
        const target: DataTransfer = <DataTransfer>(<unknown>event.target);
        if (target.files.length !== 1) {
            throw new Error('Cannot use multiple files');
        }
        const reader: FileReader = new FileReader();
        reader.readAsBinaryString(target.files[0]);
        reader.onload = (e: any) => {
            /* create workbook */
            const binarystr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });

            /* selected the first sheet */
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];

            /* save data */
            const data = XLSX.utils.sheet_to_json(ws); // to get 2d array pass 2nd parameter as object {header: 1}
            this.tableData = data;
            this.tableData.forEach((element) => {
                if (element['adresse_mail_esp']) {
                    let student = {
                        first_name: element['nom_et'].trim(),
                        last_name: element['pnom_et'].trim(),
                        id_et: element['id_et'].trim(),
                        email: element['adresse_mail_esp'].trim(),
                        class: element['classe_courante_et'].trim(),
                    };
                    this.dataStudents.push(student);

                    this.progresDetail = this.progresDetail + 1;
                }
            });
        };
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
    buttonDisabled = false;
    send(): void {
        if (this.userForm.dirty && this.userForm.valid) {
            if (!this.fromFile) {
                this._contactsService
                    .createContact(this.userForm.value)
                    .subscribe(() => {
                        this.matDialogRef.close();
                    });
            } else {
                this.buttonDisabled = true;
                const uniqueMails = this.dataStudents.filter((obj, index) => {
                    return (
                        index ===
                        this.dataStudents.findIndex(
                            (o) => obj.email === o.email
                        )
                    );
                });
                this._contactsService
                    .createContactFromFile({ dataStudents: uniqueMails })
                    .subscribe(() => {
                        this.matDialogRef.close();
                        this.buttonDisabled = false;
                    });
            }
        }
    }
}
