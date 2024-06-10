import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';
import { StudentGuard } from './core/auth/guards/student.guard';
import { ResponsableGuard } from './core/auth/guards/reponsable.guard';
import { AdminGuard } from './core/auth/guards/admin.guard';
import { path } from 'd3';
import { AdminResponsableGuard } from './core/auth/guards/admin_reponsable.guard';

// @formatter:off
// tslint:disable:max-line-length
export const appRoutes: Route[] = [
    // Redirect empty path to '/example'
    { path: '', pathMatch: 'full', redirectTo: 'example' },

    // Redirect signed in user to the '/example'
    //
    // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    // Landing routes
    { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'example' },

    {
        path: '',
        component: LayoutComponent,
        canActivate: [NoAuthGuard],
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'sign-in',
                loadChildren: () =>
                    import('app/modules/auth/sign-in/sign-in.module').then(
                        (m) => m.AuthSignInModule
                    ),
            },
        ],
    },

    //no auth
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'home',
                loadChildren: () =>
                    import('app/modules/landing/home/home.module').then(
                        (m) => m.LandingHomeModule
                    ),
            },
            {
                path: '404-not-found',
                pathMatch: 'full',
                loadChildren: () =>
                    import(
                        'app/modules/admin/error/error-404/error-404.module'
                    ).then((m) => m.Error404Module),
            },
        ],
    },

    //auth guard

    {
        path: '',
        component: LayoutComponent,
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            {
                path: 'qr-code/:full_name/:Classe/:date_cours/:seance',
                loadChildren: () =>
                    import(
                        'app/modules/studentComponents/qrcodeScan/example.module'
                    ).then((m) => m.ExampleModule),
            },
            {
                path: 'calendar',
                loadChildren: () =>
                    import('app/modules/calendar/calendar.module').then(
                        (m) => m.CalendarModule
                    ),
            },
            {
                path: 'example',
                loadChildren: () =>
                    import('app/modules/admin/example/example.module').then(
                        (m) => m.ExampleModule
                    ),
            },
            {
                path: 'settings',
                loadChildren: () =>
                    import('app/modules/admin/settings/settings.module').then(
                        (m) => m.SettingsModule
                    ),
            },
            {
                path: 'sign-out',
                data: {
                    layout: 'empty',
                },
                loadChildren: () =>
                    import('app/modules/auth/sign-out/sign-out.module').then(
                        (m) => m.AuthSignOutModule
                    ),
            },
        ],
    },

    // auth Student guard
    {
        path: '',
        component: LayoutComponent,
        canActivate: [StudentGuard],
        canActivateChild: [StudentGuard],
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            {
                path: 'MyTeachers',
                loadChildren: () =>
                    import(
                        'app/modules/studentComponents/dashboards/project/project.module'
                    ).then((m) => m.ProjectModule),
            },
        ],
    },

    // auth responsable guard
    {
        path: '',
        component: LayoutComponent,
        canActivate: [ResponsableGuard],
        canActivateChild: [ResponsableGuard],
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            {
                path: 'Dashboard',
                loadChildren: () =>
                    import(
                        'app/modules/admin/dashboards/project/project.module'
                    ).then((m) => m.ProjectModule),
            },
        ],
    },

    // auth responable or admin AuthGuard
    {
        path: '',
        component: LayoutComponent,
        canActivate: [AdminResponsableGuard],
        canActivateChild: [AdminResponsableGuard],
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            {
                path: 'students',
                loadChildren: () =>
                    import('app/modules/admin/students/contacts.module').then(
                        (m) => m.ContactsModule
                    ),
            },
            {
                path: 'gestionStudents',
                loadChildren: () =>
                    import('app/modules/admin/ecommerce/ecommerce.module').then(
                        (m) => m.ECommerceModule
                    ),
            },
            {
                path: 'teachers',
                loadChildren: () =>
                    import('app/modules/admin/teachers/contacts.module').then(
                        (m) => m.ContactsModule
                    ),
            },
            {
                path: 'gestion-up',
                loadChildren: () =>
                    import('app/modules/admin/notes/notes.module').then(
                        (m) => m.NotesModule
                    ),
            },
        ],
    },
    // auth admin guard
    {
        path: '',
        component: LayoutComponent,
        canActivate: [AdminGuard],
        canActivateChild: [AdminGuard],
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            {
                path: 'teachers',
                loadChildren: () =>
                    import('app/modules/admin/teachers/contacts.module').then(
                        (m) => m.ContactsModule
                    ),
            },
            {
                path: 'classrooms',
                loadChildren: () =>
                    import('app/modules/admin/academy/academy.module').then(
                        (m) => m.AcademyModule
                    ),
            },
            {
                path: 'gestion-up',
                loadChildren: () =>
                    import('app/modules/admin/notes/notes.module').then(
                        (m) => m.NotesModule
                    ),
            },
            {
                path: 'up-file-mangment',
                loadChildren: () =>
                    import(
                        'app/modules/admin/file-manager/file-manager.module'
                    ).then((m) => m.FileManagerModule),
            },
        ],
    },

    // Auth routes for guests
    // {
    //     path: '',
    //     canActivate: [NoAuthGuard],
    //     canActivateChild: [NoAuthGuard],
    //     component: LayoutComponent,
    //     data: {
    //         layout: 'empty',
    //     },
    //     children: [
    //         {
    //             path: 'sign-in',
    //             loadChildren: () =>
    //                 import('app/modules/auth/sign-in/sign-in.module').then(
    //                     (m) => m.AuthSignInModule
    //                 ),
    //         },
    //     ],
    // },

    // Auth routes for authenticated users
    // {
    //     path: '',
    //     canActivate: [AuthGuard],
    //     canActivateChild: [AuthGuard],
    //     component: LayoutComponent,
    //     data: {
    //         layout: 'empty',
    //     },
    //     children: [
    //         {
    //             path: 'sign-out',
    //             loadChildren: () =>
    //                 import('app/modules/auth/sign-out/sign-out.module').then(
    //                     (m) => m.AuthSignOutModule
    //                 ),
    //         },
    //         {
    //             path: 'unlock-session',
    //             loadChildren: () =>
    //                 import(
    //                     'app/modules/auth/unlock-session/unlock-session.module'
    //                 ).then((m) => m.AuthUnlockSessionModule),
    //         },
    //     ],
    // },

    // Admin routes
    // {
    //     path: '',
    //     canActivate: [AuthGuard],
    //     canActivateChild: [AuthGuard],
    //     component: LayoutComponent,
    //     resolve: {
    //         initialData: InitialDataResolver,
    //     },
    //     children: [
    //         {
    //             path: 'example',
    //             loadChildren: () =>
    //                 import('app/modules/admin/example/example.module').then(
    //                     (m) => m.ExampleModule
    //                 ),
    //         },
    //         {
    //             path: 'classrooms',
    //             loadChildren: () =>
    //                 import('app/modules/admin/academy/academy.module').then(
    //                     (m) => m.AcademyModule
    //                 ),
    //         },
    //         {
    //             path: 'settings',
    //             loadChildren: () =>
    //                 import('app/modules/admin/settings/settings.module').then(
    //                     (m) => m.SettingsModule
    //                 ),
    //         },
    //         {
    //             path: 'questions',
    //             loadChildren: () =>
    //                 import('app/modules/admin/tasks/tasks.module').then(
    //                     (m) => m.TasksModule
    //                 ),
    //         },
    //         {
    //             path: 'students',
    //             loadChildren: () =>
    //                 import('app/modules/admin/students/contacts.module').then(
    //                     (m) => m.ContactsModule
    //                 ),
    //         },
    //         {
    //             path: 'teachers',
    //             loadChildren: () =>
    //                 import('app/modules/admin/teachers/contacts.module').then(
    //                     (m) => m.ContactsModule
    //                 ),
    //         },
    //         {
    //             path: 'MyTeachers',
    //             loadChildren: () =>
    //                 import(
    //                     'app/modules/studentComponents/dashboards/project/project.module'
    //                 ).then((m) => m.ProjectModule),
    //         },
    //         {
    //             path: 'ratting-students',
    //             loadChildren: () =>
    //                 import(
    //                     'app/modules/studentComponents/ratting/academy.module'
    //                 ).then((m) => m.AcademyModule),
    //         },

    //         {
    //             path: 'scrumBoard',
    //             loadChildren: () =>
    //                 import(
    //                     'app/modules/admin/scrumboard/scrumboard.module'
    //                 ).then((m) => m.ScrumboardModule),
    //         },
    //         {
    //             path: 'gestionStudents',
    //             loadChildren: () =>
    //                 import('app/modules/admin/ecommerce/ecommerce.module').then(
    //                     (m) => m.ECommerceModule
    //                 ),
    //         },
    //         {
    //             path: 'Dashboard',
    //             loadChildren: () =>
    //                 import(
    //                     'app/modules/admin/dashboards/project/project.module'
    //                 ).then((m) => m.ProjectModule),
    //         },
    //         {
    //             path: 'gestion-up',
    //             loadChildren: () =>
    //                 import('app/modules/admin/notes/notes.module').then(
    //                     (m) => m.NotesModule
    //                 ),
    //         },
    //         {
    //             path: '404-not-found',
    //             pathMatch: 'full',
    //             loadChildren: () =>
    //                 import(
    // 'app/modules/admin/error/error-404/error-404.module'
    //                 ).then((m) => m.Error404Module),
    //         },
    //         { path: '**', redirectTo: '404-not-found' },
    //     ],
    // },

    { path: '**', redirectTo: '404-not-found' },
];
