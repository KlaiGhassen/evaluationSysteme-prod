import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CalendarService } from '../calendar.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'calendar-student-attendance',
    templateUrl: './student-attendance.component.html',
    styleUrls: ['./student-attendance.component.scss']
})
export class CalendarStudentAttendanceComponent implements OnInit {
    loading: boolean = false;
    sessionId: string;
    students: any[] = [];
    filteredStudents: any[] = [];
    searchForm: FormGroup;

    constructor(
        private _formBuilder: FormBuilder,
        private _calendarService: CalendarService,
        private _snackBar: MatSnackBar,
        private _route: ActivatedRoute,
        private _router: Router
    ) {
        this.searchForm = this._formBuilder.group({
            search: ['']
        });
    }

    ngOnInit(): void {
        this.sessionId = this._route.snapshot.params['sessionId'];
        this.loadAttendance();

        // Setup search functionality
        this.searchForm.get('search').valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged()
            )
            .subscribe(searchTerm => {
                this.filterStudents(searchTerm);
            });
    }

    filterStudents(searchTerm: string): void {
        if (!searchTerm) {
            this.filteredStudents = [...this.students];
            return;
        }

        searchTerm = searchTerm.toLowerCase();
        this.filteredStudents = this.students.filter(student => 
            student.first_name.toLowerCase().includes(searchTerm) ||
            student.last_name.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm)
        );
    }

    loadAttendance(): void {
        this.loading = true;
        this._calendarService.getSessionAttendance(this.sessionId).subscribe(
            (attendance) => {
                this.students = attendance;
                this.filteredStudents = [...attendance];
                this.loading = false;
            },
            (error) => {
                console.error('Error fetching attendance:', error);
                this.loading = false;
                this._snackBar.open('Error loading attendance data', 'Close', {
                    duration: 3000
                });
            }
        );
    }

    toggleAttendance(studentId: string): void {
        const student = this.students.find(s => s.id_student === studentId);
        if (student) {
            student.present = !student.present;
            
            // Call the API to update attendance
            this._calendarService.updateAttendance(this.sessionId, {
                studentId: studentId,
                present: student.present
            }).subscribe(
                () => {
                    // Success - no need to do anything as the UI is already updated
                },
                (error) => {
                    // Revert the toggle if there's an error
                    student.present = !student.present;
                    this._snackBar.open('Error updating attendance', 'Close', {
                        duration: 3000
                    });
                }
            );
        }
    }

    close(): void {
        this._router.navigate(['/calendar']);
    }
} 