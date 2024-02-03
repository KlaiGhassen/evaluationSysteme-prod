import { Route } from '@angular/router';
import { CanDeactivateTasksDetails } from 'app/modules/admin/tasks/tasks.guards';
import {
    QuestionsQuestionResolver,
    TasksResolver,
    TasksTagsResolver,
    TasksTaskResolver,
    QuestionsResolver,
} from 'app/modules/admin/tasks/tasks.resolvers';
import { TasksComponent } from 'app/modules/admin/tasks/tasks.component';
import { TasksListComponent } from 'app/modules/admin/tasks/list/list.component';
import { TasksDetailsComponent } from 'app/modules/admin/tasks/details/details.component';
import { QuestionsDetailsComponent } from './questionDetails/questionsDetails.component';

export const tasksRoutes: Route[] = [
    {
        path: '',
        component: TasksComponent,
        resolve: {
            tags: TasksTagsResolver,
        },
        children: [
            {
                path: '',
                component: TasksListComponent,
                resolve: {
                    tasks: TasksResolver,
                    question: QuestionsResolver,
                },
                children: [
                    {
                        path: ':id',
                        component: TasksDetailsComponent,
                        resolve: {
                            task: TasksTaskResolver,
                        },
                        canDeactivate: [CanDeactivateTasksDetails],
                    },

                    {
                        path: 'question/:questionId',
                        component: QuestionsDetailsComponent,
                        resolve: {
                            task: QuestionsQuestionResolver,
                        },
                        canDeactivate: [CanDeactivateTasksDetails],
                    },
                ],
            },
        ],
    },
];
