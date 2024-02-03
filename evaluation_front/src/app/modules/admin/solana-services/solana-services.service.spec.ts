import { TestBed } from '@angular/core/testing';

import { SolanaServicesService } from './solana-services.service';

describe('SolanaServicesService', () => {
  let service: SolanaServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolanaServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
