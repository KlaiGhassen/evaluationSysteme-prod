import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedModule } from 'app/shared/shared.module';
import { ProjectComponent } from 'app/modules/studentComponents/dashboards/project/project.component';
import { projectRoutes } from 'app/modules/studentComponents/dashboards/project/project.routing';
import { NgxStarRatingModule } from 'ngx-star-rating';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MailboxComposeComponent } from '../compose/compose.component';

@NgModule({
    declarations: [
        ProjectComponent,
        MailboxComposeComponent

    ],
    imports     : [
        MatDialogModule,
        RouterModule.forChild(projectRoutes),
        MatButtonModule,
        MatButtonToggleModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatProgressBarModule,
        MatSidenavModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        NgApexchartsModule,
        NgxStarRatingModule,
        SharedModule,
        MatSlideToggleModule
    ]
})
export class ProjectModule
{
}
