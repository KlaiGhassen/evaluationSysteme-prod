import { Route } from '@angular/router';
import { AnalyticsComponent } from 'app/modules/studentComponents/dashboards/analytics/analytics.component';
import { AnalyticsResolver } from 'app/modules/studentComponents/dashboards/analytics/analytics.resolvers';

export const analyticsRoutes: Route[] = [
    {
        path     : '',
        component: AnalyticsComponent,
        resolve  : {
            data: AnalyticsResolver
        }
    }
];
