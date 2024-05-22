import { Component, ViewChild } from '@angular/core';
import {
    ScannerQRCodeConfig,
    ScannerQRCodeResult,
    NgxScannerQrcodeService,
    NgxScannerQrcodeComponent,
    ScannerQRCodeSelectedFiles,
  } from 'ngx-scanner-qrcode';
  
@Component({
    selector: 'example',
    templateUrl: './example.component.html',
})
export class ExampleComponent {
    public config: ScannerQRCodeConfig = {
        constraints: {
          video: {
            width: window.innerWidth
          },
        },
        // canvasStyles: [
        //   { /* layer */
        //     lineWidth: 1,
        //     fillStyle: '#00950685',
        //     strokeStyle: '#00950685',
        //   },
        //   { /* text */
        //     font: '17px serif',
        //     fillStyle: '#ff0000',
        //     strokeStyle: '#ff0000',
        //   }
        // ],
      };
    
      public qrCodeResult: ScannerQRCodeSelectedFiles[] = [];
      public qrCodeResult2: ScannerQRCodeSelectedFiles[] = [];
      public percentage = 80;
      public quality:any = 100;
      
      @ViewChild('action') action!: NgxScannerQrcodeComponent;
    
   
    
      constructor(private qrcode: NgxScannerQrcodeService) { }
    
      ngAfterViewInit(): void {
        this.action.isReady.subscribe((res: any) => {
          // this.handle(this.action, 'start');
        });
      }
    
      public onEvent(e: ScannerQRCodeResult[], action?: any): void {
        // e && action && action.pause();
        console.log(e);
      }
    
      public handle(action: any, fn: string): void {
        const playDeviceFacingBack = (devices: any[]) => {
          // front camera or back camera check here!
          const device = devices.find(f => (/back|rear|environment/gi.test(f.label))); // Default Back Facing Camera
          action.playDevice(device ? device.deviceId : devices[0].deviceId);
        }
    
        if (fn === 'start') {
          action[fn](playDeviceFacingBack).subscribe((r: any) => console.log(fn, r), alert);
        } else {
          action[fn]().subscribe((r: any) => console.log(fn, r), alert);
        }
      }
    
      public onDowload(action: NgxScannerQrcodeComponent) {
        action.download().subscribe(console.log, alert);
      }
    
      public onSelects(files: any) {
        this.qrcode.loadFiles(files, this.percentage, this.quality).subscribe((res: ScannerQRCodeSelectedFiles[]) => {
          this.qrCodeResult = res;
        });
      }
    
      public onSelects2(files: any) {
        this.qrcode.loadFilesToScan(files, this.config, this.percentage, this.quality).subscribe((res: ScannerQRCodeSelectedFiles[]) => {
          console.log(res);
          this.qrCodeResult2 = res;
        });
      }
    
      public onGetConstraints() {
        const constrains = this.action.getConstraints();
        console.log(constrains);
      }
      
      public applyConstraints() {
        const constrains = this.action.applyConstraints({
          ...this.action.getConstraints(),
          width: 510
        });
        console.log(constrains);
      }
}
