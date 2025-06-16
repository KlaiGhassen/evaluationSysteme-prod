import { Route } from '@angular/router';
import { CalendarComponent } from 'app/modules/calendar/calendar.component';
import { CalendarSettingsComponent } from 'app/modules/calendar/settings/settings.component';
import {
    CalendarCalendarsResolver,
    CalendarSettingsResolver,
    CalendarWeekdaysResolver,
} from 'app/modules/calendar/calendar.resolvers';
import { ExampleComponent } from './example/example.component';
import { CalendarStudentAttendanceComponent } from './student-attendance/student-attendance.component';

export const calendarRoutes: Route[] = [
    {
        path: '',
        component: CalendarComponent,
        resolve: {
            calendars: CalendarCalendarsResolver,
            settings: CalendarSettingsResolver,
            weekdays: CalendarWeekdaysResolver,
        },
    },
    {
        path: 'settings',
        component: CalendarSettingsComponent,
        resolve: {
            settings: CalendarSettingsResolver,
        },
    },
    {
        path: 'qrScan',
        component: ExampleComponent,
    },
    {
        path: 'attendance/:sessionId',
        component: CalendarStudentAttendanceComponent,
    },
];
