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
import { SolanaServicesService } from 'app/modules/admin/solana-services/solana-services.service';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';

@Component({
    selector: 'mailbox-compose',
    templateUrl: './compose.component.html',
})
export class MailboxComposeComponent implements OnInit {
    @ViewChild('tagsPanelOrigin') private _tagsPanelOrigin: ElementRef;
    @ViewChild('tagsPanel') private _tagsPanel: TemplateRef<any>;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    userForm: FormGroup;
    beforeRating = false;
    /**
     * Constructor
     */
    constructor(
        public matDialogRef: MatDialogRef<MailboxComposeComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _solanaService: SolanaServicesService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        if (this.data == 'beforeRating') {
            this.beforeRating = true;
        }
    }
    async connectWallet() {
        await this._solanaService.connectWallet();
        let q = localStorage.getItem('publicKeywallet');
        if (q && q !== '') {
            this.matDialogRef.close();
        }
    }

    discard(): void {
        this.matDialogRef.close();
    }
    ok(): void {
        localStorage.setItem('cretaire', 'ok');
        this.matDialogRef.close();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    /**
     * Discard the message
     */
}
