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
import { academyRoutes } from 'app/modules/studentComponents/ratting/academy.routing';
import { AcademyComponent } from 'app/modules/studentComponents/ratting/academy.component';
import { AcademyDetailsComponent } from 'app/modules/studentComponents/ratting/details/details.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRadioModule } from '@angular/material/radio';
import { FuseAlertModule } from '@fuse/components/alert';

@NgModule({
    declarations: [AcademyComponent, AcademyDetailsComponent],
    imports: [
        RouterModule.forChild(academyRoutes),
        MatButtonModule,
        FuseAlertModule,
        MatFormFieldModule,
        MatIconModule,
        MatRadioModule,
        MatInputModule,
        MatProgressBarModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatTooltipModule,
        FuseFindByKeyPipeModule,
        SharedModule,
        MatTabsModule,

    ],
})
export class AcademyModule {}
