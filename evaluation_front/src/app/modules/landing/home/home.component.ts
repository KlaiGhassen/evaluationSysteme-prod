import { Component } from '@angular/core';
import Parallax from 'parallax-js';
@Component({
    selector: 'landing-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class LandingHomeComponent {
    /**
     * Constructor
     */
    constructor() {}
    ngAfterViewInit() {
        // Add the parallax code here
        let scene = document.getElementById('scene');
        let parallaxInstance = new Parallax(scene);
    }
}
