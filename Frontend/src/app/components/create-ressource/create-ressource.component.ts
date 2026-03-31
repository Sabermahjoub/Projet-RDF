import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Entity } from '../../models/ressource';
import { EntityDetailsComponent } from '../entity-details/entity-details.component';
import { GestionRessourcesService } from '../../services/gestion-ressources.service';

export type OntologyLabels = Record<string, string>;

export let ONTOLOGY_LABELS: OntologyLabels = {
  "https://www.ica.org/standards/RiC/ontology#": "RIC-O",
  "http://uspn.fr/app#": "Application",
  "http://www.w3.org/2002/07/owl#": "OWL",
  "http://www.w3.org/2000/01/rdf-schema#": "RDFS",
  "http://purl.org/dc/terms/": "Dublin Core"
};

@Component({
  selector: 'app-create-ressource',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, EntityDetailsComponent],
  templateUrl: './create-ressource.component.html',
  styleUrl: './create-ressource.component.scss'
})
export class CreateRessourceComponent implements OnInit {

  personForm: FormGroup;

  selectedEntity: Entity | null = null;

  typeMode: 'existing' | 'custom' = 'existing';
  customSource: 'url' | 'full' = 'url';
  availableTypes: string[] = [];

  ontologyList: { name: string; iri: string }[] = [];

  constructor(private fb: FormBuilder, private ontologyService: GestionRessourcesService) {

    this.personForm = this.fb.group({
      entityType: [''],
      customTypeUri: [''],
      customTypeUrl: this.fb.group({
        selectedIri: [''],
        typeName: ['']
      }),
      associatedWith: this.fb.array([]),
      customFields: this.fb.array([]),
      associations: this.fb.array([])
    });

    this.ontologyList = this.getOntologyList();
  }

  ngOnInit(): void {
    this.ontologyService.getTypes().subscribe({
      next: (data: any[]) => {
        this.availableTypes = data;
      },
      error: (err) => {
        console.error("Erreur lors du chargement des types d'ontology ", err);
      }
    });
  }

  // ─── Ontology helpers ───────────────────────────────────────────────────────

  getOntologyList(): { name: string; iri: string }[] {
    return Object.entries(ONTOLOGY_LABELS).map(([iri, name]) => ({ name, iri }));
  }

  get resolvedTypeUri(): string {
    const { selectedIri, typeName } = this.personForm.get('customTypeUrl')?.value ?? {};
    if (!selectedIri || !typeName) return '';
    const sep = selectedIri.endsWith('#') || selectedIri.endsWith('/') ? '' : '#';
    return `${selectedIri}${sep}${typeName}`;
  }

  setTypeMode(mode: 'existing' | 'custom') {
    this.typeMode = mode;
    this.personForm.get('entityType')?.reset();
    this.personForm.get('customTypeUri')?.reset();
    this.personForm.get('customTypeUrl')?.reset();
  }

  setCustomSource(src: 'url' | 'full') {
    this.customSource = src;
    this.personForm.get('customTypeUri')?.reset();
    this.personForm.get('customTypeUrl')?.reset();
  }

  // ─── Associations ────────────────────────────────────────────────────────────

  get associationsArray(): FormArray {
    return this.personForm.get('associations') as FormArray;
  }

  addAssociationField() {
    const last = this.associationsArray.at(this.associationsArray.length - 1);
    if (last && (!last.get('predicate')?.value || !last.get('object')?.value)) {
      alert('Veuillez remplir les champs de l\'association avant d\'en ajouter une nouvelle.');
      return;
    }

    const associationGroup = this.fb.group({
      predicate: '',
      object: '',
      show: false
    });

    this.associationsArray.push(associationGroup);
  }

  checkAssociationVisibility(index: number): boolean {
    const associationGroup = this.associationsArray.at(index);
    return associationGroup ? associationGroup.get('show')?.value : false;
  }
 
  changeAssociationVisibility(index: number) {
    const associationGroup = this.associationsArray.at(index);
    if (associationGroup) {
      const oldValue = associationGroup.get('show')?.value;
      associationGroup.get('show')?.setValue(!oldValue);
    }
  }

  removeAssociationField(index: number) {
    this.associationsArray.removeAt(index);
  }

  // ─── Custom fields ───────────────────────────────────────────────────────────

  get customFieldsArray(): FormArray {
    return this.personForm.get('customFields') as FormArray;
  }

  addCustomField() {
    const fieldGroup = this.fb.group({
      name: [''],
      value: ['']
    });
    this.customFieldsArray.push(fieldGroup);
  }

  removeCustomField(index: number) {
    this.customFieldsArray.removeAt(index);
  }

  // ─── Form actions ────────────────────────────────────────────────────────────

  addNewPerson() {
    this.personForm.reset();
    while (this.associationsArray.length !== 0) {
      this.associationsArray.removeAt(0);
    }
    while (this.customFieldsArray.length !== 0) {
      this.customFieldsArray.removeAt(0);
    }
  }

  cancelNewPerson() {
    this.personForm.reset();
  }

  saveNewPerson() {
    console.log("Saving person : ", this.personForm)
    // implement save logic
  }
}