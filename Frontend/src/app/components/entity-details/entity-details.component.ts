import { Component, OnInit, Input, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Entity } from '../../models/ressource';
import { allEntities } from '../../models/ressource';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

import {GestionRessourcesService} from '../../services/gestion-ressources.service';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-entity-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './entity-details.component.html',
  styleUrl: './entity-details.component.scss'
})
export class EntityDetailsComponent implements OnInit, OnChanges {

  @Input() selectedEntityId: string = "";  
  selectedEntity : any = null ;
  previousSelectedEntity: Entity | null = null;
  detailTab: 'ric' | 'foaf' | 'metadata' = 'ric';
  myNewEntites : Entity[] = [];

  private gestionRessourceService = inject(GestionRessourcesService); // ← replace constructor injection
  private cdr = inject(ChangeDetectorRef); // ← add this

  // constructor(private gestionRessourceService : GestionRessourcesService ) {}

  copyToClipboard(text: string | undefined) {
    if (text && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard:', text);
        // TODO: Show toast notification
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes['selectedEntityId'] && this.selectedEntityId) {
      this.gestionRessourceService
        .getEntityDetails(this.selectedEntityId)
        .subscribe({
          next: (data) => {
            console.log("DATA:", data);
            this.selectedEntity = data;
            this.cdr.markForCheck();
          },
          error: (err) => console.error("ERROR:", err)
        });
    }
  }

  ngOnInit(): void {

    this.detailTab = 'ric';
    this.myNewEntites = allEntities;
  }


  // Remove association
  removeAssociation(person: string) {
    if (this.selectedEntity && this.selectedEntity.associatedWith) {
      this.selectedEntity.associatedWith = this.selectedEntity.associatedWith.filter((p : any) => p !== person);
    }
  }

  // Add association
  addAssociation() {
    console.log('Add association clicked');
    // TODO: Implement modal to select person to associate
  }

  changeEntityView(id: any) {
    this.previousSelectedEntity = this.selectedEntity;

    const entityFound = this.getEntityById(id);
    if (entityFound) {
      this.selectEntity(entityFound);
    }
  }

    backToPreviousEntity() {
    if (this.previousSelectedEntity) {
      const prev = this.previousSelectedEntity;
      this.previousSelectedEntity = null;
      this.selectEntity(prev);
    }
  }

  getEntityById(id: number): Entity | undefined {
    const id_str = id.toString();
    return allEntities.find(entity => entity.id === id_str);
  }

  // Select entity
  selectEntity(entity: Entity) {
    this.selectedEntity = entity;
    this.detailTab = 'ric';
  }

  closeDetail() {
    this.selectedEntity = null;
  }

  deleteEntity() {
    if (this.selectedEntity && confirm(`Êtes-vous sûr de vouloir supprimer "${this.selectedEntity.titre}" ?`)) {
      console.log('Deleting entity:', this.selectedEntity.id);
      // TODO: Implement delete logic (API call)
      
      this.myNewEntites = this.myNewEntites.filter(e => e.id !== this.selectedEntity!.id);
      // this.applyAllFilters();
      // this.updateEntityTypeCounts();
      this.closeDetail();
    }
  }

}
