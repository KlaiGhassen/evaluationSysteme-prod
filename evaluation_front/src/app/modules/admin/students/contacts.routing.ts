import { Route } from '@angular/router';
import { CanDeactivateContactsDetails } from 'app/modules/admin/students/contacts.guards';
import {
    ClassRoomsResolver,
    ContactsContactResolver,
    ContactsResolver,
} from 'app/modules/admin/students/contacts.resolvers';
import { ContactsComponent } from 'app/modules/admin/students/contacts.component';
import { ContactsListComponent } from 'app/modules/admin/students/list/list.component';
import { ContactsDetailsComponent } from 'app/modules/admin/students/details/details.component';
import { AcademyCategoriesResolver } from '../academy/academy.resolvers';

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
                    framing: ClassRoomsResolver,
                    classRooms:AcademyCategoriesResolver, 
                    
                },
                children: [
                    {
                        path: ':id',
                        component: ContactsDetailsComponent,
                        resolve: {
                            task: ContactsContactResolver,
                        },
                        canDeactivate: [CanDeactivateContactsDetails],
                    },
                ],
            },
        ],
    },
];
