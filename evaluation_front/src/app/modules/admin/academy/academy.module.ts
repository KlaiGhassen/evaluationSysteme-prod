import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseFindByKeyPipeModule } from '@fuse/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { academyRoutes } from 'app/modules/admin/academy/academy.routing';
import { AcademyComponent } from 'app/modules/admin/academy/academy.component';
import { AcademyDetailsComponent } from 'app/modules/admin/academy/details/details.component';
import { AcademyListComponent } from 'app/modules/admin/academy/list/list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MailboxComposeComponent } from './compose/compose.component';
import { MailboxComposeComponentUE } from './UE/compose.component';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { FuseConfirmationService } from '@fuse/services/confirmation/confirmation.service';
import { FuseScrollbarModule } from '@fuse/directives/scrollbar';

@NgModule({
    declarations: [
        MailboxComposeComponentUE,
        MailboxComposeComponent,
        AcademyComponent,
        AcademyDetailsComponent,
        AcademyListComponent,
    ],
    imports: [
        RouterModule.forChild(academyRoutes),
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressBarModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatTooltipModule,
        FuseFindByKeyPipeModule,
        SharedModule,
        MatTabsModule,
        MatCheckboxModule,
        FuseScrollbarModule,
    ],

    providers: [FuseConfirmationService],
})
export class AcademyModule {}
