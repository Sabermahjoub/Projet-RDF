import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

interface Entity {
  id: string;
  titre: string;
  date: string;
  source: string;
  statut: 'complet' | 'partiel';
  type: 'Event' | 'Person' | 'Record' | 'Instantiation' | 'Agent' | 'Place' | 'Record Resource';
  birthDate?: string;
  deathDate?: string;
  associatedWith?: string[];
}

interface EntityType {
  name: string;
  icon: string;
  count: number;
  type: Entity['type'];
}

@Component({
  selector: 'app-gestion-ressources',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestion-ressources.component.html',
  styleUrl: './gestion-ressources.component.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class GestionRessourcesComponent implements OnInit {
  // Entity Types for Sidebar
  entityTypes: EntityType[] = [
    { name: 'Event', icon: 'calendar', count: 2, type: 'Event' },
    { name: 'Person', icon: 'user', count: 3, type: 'Person' },
    { name: 'Record', icon: 'file-text', count: 2, type: 'Record' },
    { name: 'Instantiation', icon: 'copy', count: 2, type: 'Instantiation' },
    { name: 'Agent', icon: 'users', count: 1, type: 'Agent' },
    { name: 'Place', icon: 'map-pin', count: 2, type: 'Place' },
    { name: 'Record Resource', icon: 'archive', count: 1, type: 'Record Resource' }
  ];

  // Mock Data - Expanded
  allEntities: Entity[] = [
    {
      id: '1',
      titre: 'Marie Curie',
      date: '1867-11-07',
      source: 'Manuel',
      statut: 'complet',
      type: 'Person',
      birthDate: '07/11/1867',
      deathDate: '04/07/1934',
      associatedWith: ['Pierre Curie', 'Irène Joliot-Curie']
    },
    {
      id: '2',
      titre: 'Pierre Curie',
      date: '1859-05-15',
      source: 'Manuel',
      statut: 'partiel',
      type: 'Person',
      birthDate: '15/05/1859',
      deathDate: '19/04/1906',
      associatedWith: ['Marie Curie']
    },
    {
      id: '3',
      titre: 'Découverte du Radium',
      date: '1898-12-26',
      source: 'Archives scientifiques',
      statut: 'complet',
      type: 'Event'
    },
    {
      id: '4',
      titre: 'Laboratoire Curie',
      date: '1914-07-31',
      source: 'Archives institutionnelles',
      statut: 'complet',
      type: 'Place'
    },
    {
      id: '5',
      titre: 'Notes de recherche 1898',
      date: '1898-01-01',
      source: 'Automatique',
      statut: 'partiel',
      type: 'Record'
    },
    {
      id: '6',
      titre: 'Prix Nobel de Physique',
      date: '1903-12-10',
      source: 'Archives Nobel',
      statut: 'complet',
      type: 'Event'
    },
    {
      id: '7',
      titre: 'Institut Curie',
      date: '1909-01-01',
      source: 'Archives institutionnelles',
      statut: 'complet',
      type: 'Agent'
    },
    {
      id: '8',
      titre: 'Manuscrit original - Radioactivité',
      date: '1902-05-15',
      source: 'Bibliothèque nationale',
      statut: 'complet',
      type: 'Instantiation'
    },
    {
      id: '9',
      titre: 'Correspondance scientifique',
      date: '1900-01-01',
      source: 'Automatique',
      statut: 'partiel',
      type: 'Record Resource'
    },
    {
      id: '10',
      titre: 'Photographie de laboratoire',
      date: '1905-03-20',
      source: 'Manuel',
      statut: 'complet',
      type: 'Instantiation'
    },
    {
      id: '11',
      titre: 'Irène Joliot-Curie',
      date: '1897-09-12',
      source: 'Manuel',
      statut: 'complet',
      type: 'Person',
      birthDate: '12/09/1897',
      deathDate: '17/03/1956',
      associatedWith: ['Marie Curie', 'Frédéric Joliot-Curie']
    },
    {
      id: '12',
      titre: 'Université de Paris',
      date: '1896-01-01',
      source: 'Archives universitaires',
      statut: 'complet',
      type: 'Place'
    },
    {
      id: '13',
      titre: 'Journal de recherche 1903',
      date: '1903-06-15',
      source: 'Automatique',
      statut: 'partiel',
      type: 'Record'
    }
  ];

  filteredEntities: Entity[] = [];
  filteredEntityTypes: EntityType[] = [];
  selectedEntity: Entity | null = null;
  selectedType: Entity['type'] | null = null;
  searchQuery: string = '';
  typeSearchQuery: string = '';
  activeView: 'tableau' | 'graphe' | 'sources' | 'sparql' = 'tableau';
  detailTab: 'ric' | 'foaf' | 'metadata' = 'ric';
  
  // Sorting
  sortColumn: 'titre' | 'date' | 'source' | null = null;
  sortAscending: boolean = true;

  // Formulaire de nouvelle personne
  personForm: FormGroup;
  showPersonForm: boolean = false;

  constructor(private fb: FormBuilder) {
    this.personForm = this.fb.group({
      titre: ['', Validators.required],
      date: ['', Validators.required],
      source: ['', Validators.required],
      statut: ['', Validators.required],
      birthDate: [''],
      deathDate: [''],
      associatedWith: this.fb.array([]),
      customFields: this.fb.array([])
    });
  }

  ngOnInit() {
    this.filteredEntities = [...this.allEntities];
    this.filteredEntityTypes = [...this.entityTypes];
    this.updateEntityTypeCounts();
  }

  // Getters pour les FormArrays
  get associatedWithArray(): FormArray {
    return this.personForm.get('associatedWith') as FormArray;
  }

  get customFieldsArray(): FormArray {
    return this.personForm.get('customFields') as FormArray;
  }

  // Update entity type counts based on actual data
  updateEntityTypeCounts() {
    this.entityTypes.forEach(entityType => {
      entityType.count = this.allEntities.filter(e => e.type === entityType.type).length;
    });
  }

  // Get total count of entities
  getTotalCount(): number {
    return this.allEntities.length;
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
    const query = this.typeSearchQuery.toLowerCase().trim();
    if (query) {
      this.filteredEntityTypes = this.entityTypes.filter(et =>
        et.name.toLowerCase().includes(query)
      );
    } else {
      this.filteredEntityTypes = [...this.entityTypes];
    }
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
    let entities = [...this.allEntities];

    // Filter by type
    if (this.selectedType) {
      entities = entities.filter(e => e.type === this.selectedType);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      entities = entities.filter(e =>
        e.titre.toLowerCase().includes(query) ||
        e.date.toLowerCase().includes(query) ||
        e.source.toLowerCase().includes(query) ||
        e.type.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (this.sortColumn) {
      entities = this.sortEntities(entities, this.sortColumn);
    }

    this.filteredEntities = entities;
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

  // Select entity
  selectEntity(entity: Entity) {
    this.selectedEntity = entity;
    this.detailTab = 'ric'; // Reset to first tab
  }

  // Close detail panel
  closeDetail() {
    this.selectedEntity = null;
  }

  // Clear type filter
  clearTypeFilter() {
    this.selectedType = null;
    this.applyAllFilters();
  }

  // Clear all filters
  clearAllFilters() {
    this.selectedType = null;
    this.searchQuery = '';
    this.typeSearchQuery = '';
    this.sortColumn = null;
    this.filteredEntityTypes = [...this.entityTypes];
    this.applyAllFilters();
  }

  // Méthode pour ouvrir le formulaire de nouvelle personne
  addNewPerson() {
    this.showPersonForm = true;
    this.personForm.reset();
    // Réinitialiser les FormArrays
    while (this.associatedWithArray.length !== 0) {
      this.associatedWithArray.removeAt(0);
    }
    while (this.customFieldsArray.length !== 0) {
      this.customFieldsArray.removeAt(0);
    }
  }

  // Méthode pour annuler la création
  cancelNewPerson() {
    this.showPersonForm = false;
    this.personForm.reset();
  }

  // Ajouter un champ d'association
  addAssociationField() {
    this.associatedWithArray.push(this.fb.control(''));
  }

  // Supprimer un champ d'association
  removeAssociationField(index: number) {
    this.associatedWithArray.removeAt(index);
  }

  // Ajouter un champ personnalisé
  addCustomField() {
    const fieldGroup = this.fb.group({
      name: [''],
      value: ['']
    });
    this.customFieldsArray.push(fieldGroup);
  }

  // Supprimer un champ personnalisé
  removeCustomField(index: number) {
    this.customFieldsArray.removeAt(index);
  }

  // Sauvegarder la nouvelle personne
  saveNewPerson() {
    if (this.personForm.valid) {
      const formValue = this.personForm.value;
      
      // Générer un ID unique
      const newId = (this.allEntities.length + 1).toString();
      
      // Créer la nouvelle entité
      const newPerson: Entity = {
        id: newId,
        titre: formValue.titre,
        date: formValue.date,
        source: formValue.source,
        statut: formValue.statut as 'complet' | 'partiel',
        type: 'Person',
        birthDate: formValue.birthDate,
        deathDate: formValue.deathDate,
        associatedWith: formValue.associatedWith.filter((a: string) => a.trim() !== '')
      };

      // Ajouter les champs personnalisés si présents
      if (formValue.customFields && formValue.customFields.length > 0) {
        // Stocker les champs personnalisés dans l'entité
        (newPerson as any).customFields = formValue.customFields
          .filter((f: any) => f.name && f.value)
          .reduce((acc: any, field: any) => {
            acc[field.name] = field.value;
            return acc;
          }, {});
      }

      // Ajouter à la liste
      this.allEntities.push(newPerson);
      
      // Mettre à jour l'affichage
      this.applyAllFilters();
      this.updateEntityTypeCounts();
      
      // Réinitialiser et fermer le formulaire
      this.cancelNewPerson();
      
      // Sélectionner la nouvelle entité
      this.selectEntity(newPerson);
      
      console.log('Nouvelle personne créée:', newPerson);
    }
  }

  // Edit entity
  editEntity(entity: Entity, event: Event) {
    event.stopPropagation(); // Prevent row click
    console.log('Edit entity:', entity);
    // TODO: Implement edit modal
  }

  // Save entity
  saveEntity() {
    if (this.selectedEntity) {
      console.log('Saving entity:', this.selectedEntity);
      // TODO: Implement save logic (API call)
    }
  }

  // Delete entity
  deleteEntity() {
    if (this.selectedEntity && confirm(`Êtes-vous sûr de vouloir supprimer "${this.selectedEntity.titre}" ?`)) {
      console.log('Deleting entity:', this.selectedEntity.id);
      // TODO: Implement delete logic (API call)
      
      // Remove from array (temporary)
      this.allEntities = this.allEntities.filter(e => e.id !== this.selectedEntity!.id);
      this.applyAllFilters();
      this.updateEntityTypeCounts();
      this.closeDetail();
    }
  }

  // Export data
  exportData() {
    console.log('Exporting data...');
    // TODO: Implement export functionality (CSV, JSON, etc.)
    
    // Simple JSON download example
    const dataStr = JSON.stringify(this.filteredEntities, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ric-o-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Copy to clipboard
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

  // Get icon for entity type
  getIconPath(iconName: string): string {
    const icons: { [key: string]: string } = {
      'calendar': 'M8 2v3m8-3v3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      'user': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      'file-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'copy': 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
      'users': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      'map-pin': 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
      'archive': 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
    };
    return icons[iconName] || icons['file-text'];
  }

  // Get icon path for entity type
  getIconPathForType(type: Entity['type']): string {
    const typeIcon = this.entityTypes.find(et => et.type === type);
    return typeIcon ? this.getIconPath(typeIcon.icon) : this.getIconPath('file-text');
  }

  // Set active view
  setView(view: 'tableau' | 'graphe' | 'sources' | 'sparql') {
    this.activeView = view;
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

  // TrackBy function for performance
  trackByEntityId(index: number, entity: Entity): string {
    return entity.id;
  }
}