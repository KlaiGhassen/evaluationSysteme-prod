import { Route } from '@angular/router';
import { ProjectComponent } from 'app/modules/studentComponents/dashboards/project/project.component';
import {
    ProjectResolver,
    RosResolver,
    TeachersResolver,
    framingResolver,
} from 'app/modules/studentComponents/dashboards/project/project.resolvers';

export const projectRoutes: Route[] = [
    {
        path: '',
        component: ProjectComponent,
        resolve: {
            data: ProjectResolver,
            teachers: TeachersResolver,
            framing: framingResolver,
            RosResolver: RosResolver,
        },
    },
];
