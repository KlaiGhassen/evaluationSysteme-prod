/* eslint-disable */
import * as moment from 'moment';

export const calendars = [
    {
        id: '1a470c8e-40ed-4c2d-b590-a4f1f6ead6cc',
        title: 'seance',
        color: 'bg-teal-500',
        visible: true,
    },
];
export const events = [
    // Personal
    {
        id: '3be50686-e3a1-4f4b-aa4d-5cb8517ba4e4',
        calendarId: '1a470c8e-40ed-4c2d-b590-a4f1f6ead6cc',
        title: 'Portfolio Design',
        description: '',
        start: moment()
            .hour(9)
            .minute(0)
            .second(0)
            .millisecond(0)
            .toISOString(), // Today 09:00
        end: moment()
            .add(1, 'day')
            .hour(14)
            .minute(0)
            .second(0)
            .millisecond(0)
            .toISOString(), // Tomorrow 14:00
        duration: null,
        allDay: false,
        recurrence: null,
    },
    {
        id: '660f0dcd-48f8-4266-a89a-8ee0789c074a',
        calendarId: '1a470c8e-40ed-4c2d-b590-a4f1f6ead6cc',
        title: 'Dinner with Mom',
        description: 'Do not forget to buy her lilacs!',
        start: moment()
            .date(10)
            .hour(18)
            .minute(0)
            .second(0)
            .millisecond(0)
            .toISOString(), // 10th of the current month at 18:00
        end: moment()
            .date(10)
            .hour(20)
            .minute(0)
            .second(0)
            .millisecond(0)
            .toISOString(), // 10th of the current month at 20:00
        duration: null,
        allDay: false,
        recurrence: null,
    },
    {
        id: '7471b840-5efb-45da-9092-a0f04ee5617b',
        calendarId: '1a470c8e-40ed-4c2d-b590-a4f1f6ead6cc',
        title: 'Lunch with Becky',
        description: '',
        start: moment()
            .date(21)
            .hour(12)
            .minute(0)
            .second(0)
            .millisecond(0)
            .toISOString(), // 21st of the current month at noon
        end: moment()
            .date(21)
            .hour(14)
            .minute(0)
            .second(0)
            .millisecond(0)
            .toISOString(), // 21st of the current month at 14:00
        duration: null,
        allDay: false,
        recurrence: null,
    },
    {
        id: 'c3e6c110-9b67-4e6b-a2ab-3046abf1b074',
        calendarId: '1a470c8e-40ed-4c2d-b590-a4f1f6ead6cc',
        title: "Mom's Birthday",
        description: '',
        start: moment().date(8).startOf('day').toISOString(), // 8th of the current month at start of the day
        end: moment().year(9999).endOf('year').toISOString(), // End of the times
        duration: 0,
    },
    // Appointments
];
export const exceptions = [];
export const settings = {
    dateFormat: 'll', // Aug 20, 2019
    timeFormat: '24', // 24-hour format
    startWeekOn: 1, // Monday
};
export const weekdays = [
    {
        abbr: 'M',
        label: 'Monday',
        value: 'MO',
    },
    {
        abbr: 'T',
        label: 'Tuesday',
        value: 'TU',
    },
    {
        abbr: 'W',
        label: 'Wednesday',
        value: 'WE',
    },
    {
        abbr: 'T',
        label: 'Thursday',
        value: 'TH',
    },
    {
        abbr: 'F',
        label: 'Friday',
        value: 'FR',
    },
    {
        abbr: 'S',
        label: 'Saturday',
        value: 'SA',
    },
    {
        abbr: 'S',
        label: 'Sunday',
        value: 'SU',
    },
];
