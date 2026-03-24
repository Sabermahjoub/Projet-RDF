import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeEntitesComponent } from './liste-entites.component';

describe('ListeEntitesComponent', () => {
  let component: ListeEntitesComponent;
  let fixture: ComponentFixture<ListeEntitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeEntitesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeEntitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
