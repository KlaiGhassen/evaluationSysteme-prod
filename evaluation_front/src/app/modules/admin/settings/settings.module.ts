import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FuseAlertModule } from '@fuse/components/alert';
import { SharedModule } from 'app/shared/shared.module';
import { SettingsComponent } from 'app/modules/admin/settings/settings.component';
import { SettingsAccountComponent } from 'app/modules/admin/settings/account/account.component';
import { SettingsSecurityComponent } from 'app/modules/admin/settings/security/security.component';
import { SettingsNotificationsComponent } from 'app/modules/admin/settings/notifications/notifications.component';
import { SettingsTeamComponent } from 'app/modules/admin/settings/team/team.component';
import { settingsRoutes } from 'app/modules/admin/settings/settings.routing';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { FuseConfirmationService } from '@fuse/services/confirmation/confirmation.service';
import { MatDialogModule } from '@angular/material/dialog';
import { SettingsPlanBillingComponent } from './plan-billing/plan-billing.component';

@NgModule({
    declarations: [
        SettingsComponent,
        SettingsAccountComponent,
        SettingsSecurityComponent,
        SettingsNotificationsComponent,
        SettingsTeamComponent,
        SettingsPlanBillingComponent
    ],
    imports: [
        RouterModule.forChild(settingsRoutes),
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatRadioModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        FuseAlertModule,
        NgxDropzoneModule,
        SharedModule,
        MatDialogModule,
    ],
    providers: [FuseConfirmationService],
})
export class SettingsModule {}
