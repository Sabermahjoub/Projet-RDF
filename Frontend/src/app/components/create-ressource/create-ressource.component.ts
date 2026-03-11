import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Entity } from '../../models/ressource';
import { EntityDetailsComponent } from '../entity-details/entity-details.component';


@Component({
  selector: 'app-create-ressource',
  imports: [FormsModule, ReactiveFormsModule,CommonModule, EntityDetailsComponent],
  templateUrl: './create-ressource.component.html',
  styleUrl: './create-ressource.component.scss'
})


export class CreateRessourceComponent implements OnInit {

  personForm: FormGroup;

  selectedEntity: Entity | null = null;

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
      associatedWith: [2, 11]
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
      associatedWith: [1]
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
  constructor(private fb: FormBuilder) {
    
    this.personForm = this.fb.group({
      titre: ['', Validators.required],
      date: ['', Validators.required],
      source: ['', Validators.required],
      statut: ['', Validators.required],
      birthDate: [''],
      deathDate: [''],
      associatedWith: this.fb.array([]),
      customFields: this.fb.array([]),
      associations: this.fb.array([])
    });
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
  }

  get associationsArray(): FormArray {
    return this.personForm.get('associations') as FormArray;
  }


  addAssociationField() {

    if (this.associationsArray.at(this.associationsArray.length - 1)?.get('predicate')?.value === '' ||
        this.associationsArray.at(this.associationsArray.length - 1)?.get('object')?.value === '') {
      alert('Veuillez remplir les champs de l\'association avant d\'en ajouter une nouvelle.');
      return;
    }

    const associationGroup = this.fb.group({
      predicate: '',
      object: '',
      show : false
    });

    this.associationsArray.push(associationGroup);

    console.log("Association added. Current associations:", this.associationsArray.value);
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

  get customFieldsArray(): FormArray {
    return this.personForm.get('customFields') as FormArray;
  }

  // Méthode pour ouvrir le formulaire de nouvelle personne
  addNewPerson() {
    this.personForm.reset();
    // Réinitialiser les FormArrays
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
      // this.applyAllFilters();
      // this.updateEntityTypeCounts();
      
      // // Réinitialiser et fermer le formulaire
      // this.cancelNewPerson();
      
      // // Sélectionner la nouvelle entité
      // this.selectEntity(newPerson);
      
      console.log('Nouvelle personne créée:', newPerson);
    }
  }

}
