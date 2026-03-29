import { TestBed } from '@angular/core/testing';

import { GestionProjetService } from './gestion-projet.service';

describe('GestionProjetService', () => {
  let service: GestionProjetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestionProjetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
