import { Route } from '@angular/router';
import { AcademyComponent } from 'app/modules/admin/academy/academy.component';
import { AcademyListComponent } from 'app/modules/admin/academy/list/list.component';
import { AcademyDetailsComponent } from 'app/modules/admin/academy/details/details.component';
import {
    AcademyCategoriesResolver,
    AcademyCourseResolver,
    AcademyCoursesResolver,
    AcademyCumResolver,
    RoTeachers,
    TasksTagsResolver,
} from 'app/modules/admin/academy/academy.resolvers';

export const academyRoutes: Route[] = [
    {
        path: '',
        component: AcademyComponent,
        resolve: {
            categories: AcademyCategoriesResolver,
            cum: AcademyCumResolver,
        },
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: AcademyListComponent,
                resolve: {
                    courses: AcademyCoursesResolver,
                    classrooms: TasksTagsResolver,
                    RoTeachers: RoTeachers,
                },
            },
        ],
    },
];
