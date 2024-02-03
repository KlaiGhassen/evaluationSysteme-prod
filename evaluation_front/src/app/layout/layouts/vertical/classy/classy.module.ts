import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FuseNavigationModule } from '@fuse/components/navigation';
import { FuseFullscreenModule } from '@fuse/components/fullscreen/fullscreen.module';
import { MessagesModule } from 'app/layout/common/messages/messages.module';
import { NotificationsModule } from 'app/layout/common/notifications/notifications.module';
import { SearchModule } from 'app/layout/common/search/search.module';
import { ShortcutsModule } from 'app/layout/common/shortcuts/shortcuts.module';
import { UserModule } from 'app/layout/common/user/user.module';
import { SharedModule } from 'app/shared/shared.module';
import { ClassyLayoutComponent } from 'app/layout/layouts/vertical/classy/classy.component';
import { FuseAlertModule } from '@fuse/components/alert';
import { FuseConfirmationService } from '@fuse/services/confirmation/confirmation.service';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
    declarations: [ClassyLayoutComponent],
    imports: [
        MatDialogModule,
        FuseAlertModule,
        HttpClientModule,
        RouterModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        FuseFullscreenModule,
        FuseNavigationModule,
        MessagesModule,
        NotificationsModule,
        SearchModule,
        ShortcutsModule,
        UserModule,
        SharedModule,
    ],
    providers: [FuseConfirmationService],
    exports: [ClassyLayoutComponent],
})
export class ClassyLayoutModule {}
