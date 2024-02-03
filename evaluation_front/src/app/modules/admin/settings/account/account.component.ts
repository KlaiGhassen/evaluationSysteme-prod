import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseAlertType } from '@fuse/components/alert';
import { UserService } from 'app/core/user/user.service';

@Component({
    selector: 'settings-account',
    templateUrl: './account.component.html',
})
export class SettingsAccountComponent implements OnInit {
    accountForm: FormGroup;
    files: File[] = [];
    imageValidator: boolean = false;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    showAlert: boolean = false;
    user;
    /**
     * Constructor
     */

    constructor(
        private _formBuilder: FormBuilder,
        private _userService: UserService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    async ngOnInit() {
        this.imageValidator = false;
        this._userService.user$.subscribe((user) => {
            this.user = user;
            this.accountForm = this._formBuilder.group({
                first_name: [user.first_name],
                last_name: [user.last_name],
                //    username: ['brianh'],
                // title: ['Senior Frontend Developer'],
                // company: ['YXZ Software'],
                about: [
                    "Hey! This is Brian; husband, father and gamer. I'm mostly passionate about bleeding edge tech and chocolate! 🍫",
                ],
                email: [
                    user.email,
                    [
                        Validators.email,
                        Validators.required,
                        Validators.pattern('^.+@esprit.tn$'),
                    ],
                ],
                phone: [user.phone],
            });
            this._userService
                .downloadMediaFromUser(user.image)
                .subscribe((blob) => {
                    if (this.files.length > 0) {
                        this.files = [];
                    }
                    this.files.push(this.blobToFile(blob, 'profile_picture'));
                });
        });
    }
    getProvider = () => {
        if ('phantom' in window) {
            const provider = window.phantom?.solana;

            if (provider?.isPhantom) {
                return provider;
            }
        }

        window.open('https://phantom.app/', '_blank');
    };

    public blobToFile = (theBlob: Blob, fileName: string): File => {
        var b: any = theBlob;
        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        b.lastModifiedDate = new Date();
        b.name = fileName;

        //Cast to a File() type
        return <File>theBlob;
    };

    onSelect(event: any) {
        if (this.files.length > 0) {
            this.files = [];
        }
        this.imageValidator = true;
        this.files.push(...event.addedFiles);
    }
    onRemove(event: any) {
        this.files.splice(this.files.indexOf(event), 1);
    }
    updateProfile() {
        if (this.accountForm.invalid) {
            this.alert = {
                type: 'error',
                message: 'check fields',
            };

            // Show the alert
            this.showAlert = true;
            return;
        }
        if (this.imageValidator) {
            this._userService
                .uploadMedia(this.files[0])
                .subscribe((response) => {
                    if (response) {
                        this.alert = {
                            type: 'success',
                            message: 'profile updated with success',
                        };
                        this.showAlert = true;
                    }
                    setTimeout(() => {
                        this.showAlert = false;
                    }, 3000);
                });
        }
        this._userService
            .update(this.accountForm.value)
            .subscribe((response) => {
                if (response) {
                    this.alert = {
                        type: 'success',
                        message: 'profile updated with success',
                    };
                    this.showAlert = true;
                }
                setTimeout(() => {
                    this.showAlert = false;
                }, 3000);
            });

        this.ngOnInit();
    }
}
