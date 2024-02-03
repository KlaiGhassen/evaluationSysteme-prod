import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { ExampleComponent } from 'app/modules/admin/example/example.component';
import { FuseConfirmationService } from '@fuse/services/confirmation/confirmation.service';
import { MatDialogModule } from '@angular/material/dialog';

const exampleRoutes: Route[] = [
    {
        path: '',
        component: ExampleComponent,
    },
];

@NgModule({
    declarations: [ExampleComponent],
    imports: [RouterModule.forChild(exampleRoutes), MatDialogModule],
    providers: [FuseConfirmationService],
})
export class ExampleModule {}
