import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FuseMasonryModule } from '@fuse/components/masonry';
import { SharedModule } from 'app/shared/shared.module';
import { NotesComponent } from 'app/modules/admin/notes/notes.component';
import { NotesListComponent } from 'app/modules/admin/notes/list/list.component';
import { NotesLabelsComponent } from 'app/modules/admin/notes/labels/labels.component';
import { notesRoutes } from 'app/modules/admin/notes/notes.routing';
import { OrgChartModule } from 'angular-org-chart';
import { FuseConfirmationService } from '@fuse/services/confirmation/confirmation.service';

@NgModule({
    declarations: [NotesComponent, NotesListComponent, NotesLabelsComponent],
    imports: [
        RouterModule.forChild(notesRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatRippleModule,
        MatSidenavModule,
        FuseMasonryModule,
        SharedModule,
        OrgChartModule,
    ],
    providers: [FuseConfirmationService],
})
export class NotesModule {}
