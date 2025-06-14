import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import * as XLSX from 'xlsx';
import * as QRCode from 'qrcode';
import { ContactsService } from '../contacts.service';
import { environment } from 'environments/environment.prod';
@Component({
    selector: 'horaire-compose',
    templateUrl: './compose-horaire.component.html',
})
export class HorarireComposeComponent implements OnInit {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    userForm: FormGroup;
    searchInputControl: FormControl = new FormControl();
    categories: any[];
    fromFile: boolean = false;
    files: File[] = [];
    dataStudents = [];
    amount = 0;
    public tableData: any;
    public tableTitle: any;
    public customPagination = 1;
    public recordsPerPage = 10;
    public tableRecords = [];
    public pageStartCount = 0;
    public pageEndCount = 10;
    public totalPageCount = 0;
    public currentPage = 0;
    public linkToScanBaseUrl: string = (environment.websiteUrl = '/qr-code/');
    progresDetail = 0;
    isTransaction = false;

    file = {
        type: 'XLS',
    };

    /**
     * Constructor
     */
    constructor(
        private _contactsService: ContactsService,
        public matDialogRef: MatDialogRef<HorarireComposeComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.isTransaction = this.data.isTransaction;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {}
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

    formatDateToYYYYDDMM(date: Date): string {
        const year = date.getFullYear();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based in JS

        return `${year}-${day}-${month}`;
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
            console.log('check here ', data);
            this.tableData = data;
            this.tableData.forEach((element) => {
                let excelDate = element['Date Cours'];
                let jsDate = new Date((excelDate - 25569) * 1000 * 86400); // Convert Excel date to JS date
                element['date_cours'] = jsDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
                element['seance'] = element['Séance'];
                element['full_name'] = element['Nom'];
                element['module'] = element['Module'];
                element['nbrh'] = element['Nbr Heures'];
                element['classe'] = element['Classe'];
                let qrcode = this.generateAndSendQRCodes(
                    this.linkToScanBaseUrl +
                        element['full_name'] +
                        '/' +
                        element['Classe'] +
                        '/' +
                        element['date_cours'] +
                        '/' +
                        element['seance']
                );
                element['linktoscan'] =
                    this.linkToScanBaseUrl +
                    element['full_name'] +
                    '/' +
                    element['Classe'] +
                    '/' +
                    element['date_cours'] +
                    '/' +
                    element['seance'];
                element['qrcode'] = qrcode;
                this.dataStudents.push(element);
                this.progresDetail = this.progresDetail + 100;
            });
        };
    }
    async generateAndSendQRCodes(qrCodeValue) {
        try {
            // Generate QR code as a buffer
            const qrCodeBuffer = await QRCode.toDataURL(qrCodeValue, {
                errorCorrectionLevel: 'M',
            });
            console.log(qrCodeBuffer);
            // Convert the buffer to a Blob
            return qrCodeBuffer;
        } catch (error) {
            console.error('Error generating QR code', error);
            return null;
        }
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
    send(): void {
        this._contactsService
            .addSeance(this.dataStudents)
            .subscribe((response) => {
                this.matDialogRef.close();
            });
    }
}
