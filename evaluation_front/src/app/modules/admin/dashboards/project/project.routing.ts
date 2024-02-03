import { Route } from '@angular/router';
import { ProjectComponent } from 'app/modules/admin/dashboards/project/project.component';
import {
    DataFraming,
    DataResolver,
    ProjectResolver,
    StudentNumberResolver,
    TeachersResolver,
    chartResolver,
} from 'app/modules/admin/dashboards/project/project.resolvers';

export const projectRoutes: Route[] = [
    {
        path: '',
        component: ProjectComponent,
        resolve: {
            data: ProjectResolver,
            team: TeachersResolver,
            teachingData: DataResolver,
            framingData: DataFraming,
            studentchart: chartResolver,
            StudentNumberResolver: StudentNumberResolver,
        },
    },
];
