/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboards.project',
        title: 'Project',
        type: 'basic',
        icon: 'heroicons_outline:clipboard-check',
        link: '/Dashboard',
        Role: 'TEACHER|CUP|RDI|RO|CD',
    },
    {
        id: 'Subjects',
        title: 'Subjects',
        type: 'basic',
        icon: 'heroicons_outline:academic-cap',
        link: '/classrooms',
        Role: 'ADMIN',
    },
    {
        id: 'Teachers',
        title: 'Teachers',
        type: 'basic',
        icon: 'heroicons_outline:user-group',
        link: '/teachers',
        Role: 'ADMIN|CUP|CD',
    },
    {
        id: ' Students',
        title: ' Students',
        type: 'basic',
        icon: 'heroicons_outline:user-group',
        link: '/gestionStudents',
        Role: 'ADMIN|TEACHER|CUP|RDI|RO',
    },
    {
        id: 'Pedagogic Units group',
        title: 'Pedagogic Units group',
        type: 'basic',
        icon: 'heroicons_outline:cog',
        link: '/gestion-up',
        Role: 'ADMIN|CD',
    },
    // {
    //     id: 'Pedagogic Units group',
    //     title: 'Pedagogic Units group',
    //     type: 'basic',
    //     icon: 'heroicons_outline:cog',
    //     link: '/up-file-mangment',
    //     Role: 'ADMIN|CD',
    // },
    {
        id: 'apps.calendar',
        title: 'Calendar',
        type: 'basic',
        icon: 'heroicons_outline:calendar',
        link: '/calendar',
        Role: 'TEACHER|CUP|RDI|RO|CD|ADMIN|STUDENT',
    },
    {
        id: 'My Teachers',
        title: 'My Teachers',
        type: 'basic',
        icon: 'heroicons_outline:clipboard-check',
        link: '/MyTeachers',
        Role: 'STUDENT',
    },
    {
        id: 'ScrumBoard',
        title: 'ScrumBoard',
        type: 'basic',
        icon: 'heroicons_outline:clipboard-check',
        link: '/scrumBoard',
        Role: 'None',
    },
    {
        id: 'Questions',
        title: 'Questions',
        type: 'basic',
        icon: 'heroicons_outline:check-circle',
        link: '/questions',
        Role: 'None',
    },
    {
        id: 'Settings',
        title: 'Settings',
        type: 'basic',
        icon: 'heroicons_outline:cog',
        link: '/settings',
        Role: 'ALL',
    },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
];
