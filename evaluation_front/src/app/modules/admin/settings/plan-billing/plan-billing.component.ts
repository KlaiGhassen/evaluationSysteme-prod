import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SolanaServicesService } from '../../solana-services/solana-services.service';

@Component({
    selector: 'settings-plan-billing',
    templateUrl: './plan-billing.component.html',
})
export class SettingsPlanBillingComponent implements OnInit {
    mint: any = '';
    fromTokenAccount: any = '';
    plans: any[];
    balance: any;
    step1 = false;
    step2 = false;
    /**
     * Constructor
     */
    constructor(
        private _solanaService: SolanaServicesService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    async ngOnInit() {
        // Setup the plans
        await this._solanaService.checkBalance();
        if (this._solanaService.balance) {
            this.balance = this._solanaService.balance;
        }
        this.plans = [
            {
                mint: '',
                label: 'Mint',
                details: 'Mint Token is generated',
            },
            {
                fromTokenAccount: '',
                label: 'Token Account',
                details: 'Token Account',
            },
            {
                label: 'Token Balance Account',
                details: 'Total Balance',
                price: this.balance,
            },
        ];
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

    async createToken() {
        if (await this._solanaService.createToken()) {
            this.step1 = true;
        }
    }
    async mintToken() {
        if (await this._solanaService.mintToken()) {
            this.step2 = true;
            this.ngOnInit();
        }
    }
}
