import { Route } from '@angular/router';
import { CanDeactivateContactsDetails } from 'app/modules/admin/teachers/contacts.guards';
import {
    ClassRoomsResolver,
    ContactsContactResolver,
    ContactsResolver,
    ModulesResolver,
    ProjectResolver,
    TeacherRateResolver,
    UpResolver,
    chartResolver,
    dataFraming,
} from 'app/modules/admin/teachers/contacts.resolvers';
import { ContactsComponent } from 'app/modules/admin/teachers/contacts.component';
import { ContactsListComponent } from 'app/modules/admin/teachers/list/list.component';
import { ContactsDetailsComponent } from 'app/modules/admin/teachers/details/details.component';

export const contactsRoutes: Route[] = [
    {
        path: '',
        component: ContactsComponent,
        resolve: {},
        children: [
            {
                path: '',
                component: ContactsListComponent,
                resolve: {
                    tasks: ContactsResolver,
                    classRooms: ClassRoomsResolver,
                    modules: ModulesResolver,
                    ups: UpResolver,
                },
                children: [
                    {
                        path: ':id',
                        component: ContactsDetailsComponent,
                        resolve: {
                            task: ContactsContactResolver,
                            chart: ProjectResolver,
                            chartSeries: chartResolver,
                            framingData: dataFraming,
                            TeacherRateResolver: TeacherRateResolver,
                        },
                        canDeactivate: [CanDeactivateContactsDetails],
                    },
                ],
            },
        ],
    },
];
