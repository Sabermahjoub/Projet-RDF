import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Entity } from '../../models/ressource';
import { allEntities } from '../../models/ressource';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

import { MatDialogModule, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-entity-details',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './entity-details.component.html',
  styleUrl: './entity-details.component.scss'
})
export class EntityDetailsComponent implements OnInit {

  selectedEntity: Entity | null = null;
  previousSelectedEntity: Entity | null = null;
  detailTab: 'ric' | 'foaf' | 'metadata' = 'ric';
  myNewEntites : Entity[] = [];

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

  ngOnInit(): void {
     this.selectedEntity = {
      id: '1',
      titre: 'Marie Curie',
      date: '1867-11-07',
      source: 'Manuel',
      statut: 'complet',
      type: 'Person',
      birthDate: '07/11/1867',
      deathDate: '04/07/1934',
      associatedWith: [2, 11]
    };
    this.detailTab = 'ric';
    this.myNewEntites = allEntities;

  }


  // Remove association
  removeAssociation(person: string) {
    if (this.selectedEntity && this.selectedEntity.associatedWith) {
      this.selectedEntity.associatedWith = this.selectedEntity.associatedWith.filter(p => p !== person);
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
