import { Route } from '@angular/router';
import { SettingsComponent } from 'app/modules/admin/settings/settings.component';
import {
    NotRdiReservor,
    RdiTeamResolver,
    TeachersResolver,
} from '../dashboards/project/project.resolvers';

export const settingsRoutes: Route[] = [
    {
        path: '',
        component: SettingsComponent,
        resolve: {
            teacherData: NotRdiReservor,
            RdiTeamResolver: RdiTeamResolver,
        },
    },
];
