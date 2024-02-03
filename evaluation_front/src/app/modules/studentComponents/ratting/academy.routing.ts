import { Route } from '@angular/router';
import { AcademyComponent } from 'app/modules/studentComponents/ratting/academy.component';
import { AcademyDetailsComponent } from 'app/modules/studentComponents/ratting/details/details.component';
import {
    AcademyCategoriesResolver,
    AcademyCourseResolver,
} from 'app/modules/studentComponents/ratting/academy.resolvers';

export const academyRoutes: Route[] = [
    {
        path: '',
        component: AcademyComponent,
        resolve: {
            categories: AcademyCategoriesResolver,
        },
        children: [
            {
                path: ':id',
                component: AcademyDetailsComponent,
                resolve: {
                    course: AcademyCourseResolver,
                },
            },
        ],
    },
];
