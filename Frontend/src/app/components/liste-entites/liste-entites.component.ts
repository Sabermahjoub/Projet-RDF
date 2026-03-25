import { Component, OnInit, Input,  OnChanges, SimpleChanges } from '@angular/core';
import { Entity } from '../../models/ressource';
import { CommonModule } from '@angular/common';
import { CreateRessourceComponent } from '../create-ressource/create-ressource.component';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-liste-entites',
  imports: [CommonModule,MatDialogModule],
  templateUrl: './liste-entites.component.html',
  styleUrl: './liste-entites.component.scss'
})
export class ListeEntitesComponent {

  selectedType: string | null = '';
  @Input() allEntities:  any [] = [];
  // entityKey!: string;
  // entityList!: any[];


  selectedEntity: Entity | null = null;
  searchQuery: string = '';
  typeSearchQuery: string = '';
  detailTab: 'ric' | 'foaf' | 'metadata' = 'ric';

  // Sorting
  sortColumn: 'titre' | 'date' | 'source' | null = null;
  sortAscending: boolean = true;

  constructor(private dialog: MatDialog) {}

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['allEntities'] && this.allEntities) {
  //     const entry = Object.entries(this.allEntities)[0];
  //     if (entry) {
  //       this.entityKey = entry[0];
  //       this.entityList = entry[1];
  //     }
  //     console.log('ENTRY:', entry);
  //   }
  // }

  openCreateRessourceDialog() {
    this.dialog.open(CreateRessourceComponent, {
      width: '600px'
    });
  }

   // Get total count of entities
  getTotalCount(): number {
    return this.allEntities.length;
  }

  clearTypeFilter() {
    this.selectedType = null;
    this.applyAllFilters();
  }

  // Clear all filters
  clearAllFilters() {
    // this.selectedType = null;
    // this.searchQuery = '';
    // this.typeSearchQuery = '';
    // this.sortColumn = null;
    // this.entityList = [...this.entityList];
    // this.applyAllFilters();
  }

  // TrackBy function for performance
  trackByEntityId(index: number, entity: Entity): string {
    return entity.id;
  }

  // Select entity
  selectEntity(entity: Entity) {
    this.selectedEntity = entity;
    this.detailTab = 'ric';
  }


  // Filter by entity type
  filterByType(type: Entity['type']) {
    if (this.selectedType === type) {
      this.selectedType = null;
      this.applyAllFilters();
    } else {
      this.selectedType = type;
      this.applyAllFilters();
    }
  }

  // Search in entity types
  onTypeSearch() {
    // const query = this.typeSearchQuery.toLowerCase().trim();
    // if (query) {
    //   this.entityList = this.entityList.filter(et =>
    //     et.name.toLowerCase().includes(query)
    //   );
    // } else {
    //   this.entityList = [...this.entityList];
    // }
  }

  // Search functionality
  onSearch() {
    this.applyAllFilters();
  }

  // Clear search
  clearSearch() {
    this.searchQuery = '';
    this.applyAllFilters();
  }

  // Apply all filters (type + search + sort)
  applyAllFilters() {
    // let entities = [...this.entityList];

    // // Filter by type
    // if (this.selectedType) {
    //   entities = entities.filter(e => e.type === this.selectedType);
    // }

    // // Filter by search query
    // if (this.searchQuery.trim()) {
    //   const query = this.searchQuery.toLowerCase();
    //   entities = entities.filter(e =>
    //     e.titre.toLowerCase().includes(query) ||
    //     e.date.toLowerCase().includes(query) ||
    //     e.source.toLowerCase().includes(query) ||
    //     e.type.toLowerCase().includes(query)
    //   );
    // }

    // // Apply sorting
    // if (this.sortColumn) {
    //   entities = this.sortEntities(entities, this.sortColumn);
    // }

    // this.entityList = entities;
  }

  // Sort entities
  sortEntities(entities: Entity[], column: 'titre' | 'date' | 'source'): Entity[] {
    return entities.sort((a, b) => {
      let compareA = a[column].toLowerCase();
      let compareB = b[column].toLowerCase();

      if (column === 'date') {
        // Sort dates chronologically
        compareA = new Date(a.date).getTime().toString();
        compareB = new Date(b.date).getTime().toString();
      }

      if (this.sortAscending) {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });
  }

  // Sort by column
  sortBy(column: 'titre' | 'date' | 'source') {
    if (this.sortColumn === column) {
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortColumn = column;
      this.sortAscending = true;
    }
    this.applyAllFilters();
  }

  // Toggle sort order
  toggleSortOrder() {
    this.sortAscending = !this.sortAscending;
    if (this.sortColumn) {
      this.applyAllFilters();
    }
  }
}