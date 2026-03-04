import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionSourcesComponent } from './gestion-sources.component';

describe('GestionSourcesComponent', () => {
  let component: GestionSourcesComponent;
  let fixture: ComponentFixture<GestionSourcesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionSourcesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionSourcesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
