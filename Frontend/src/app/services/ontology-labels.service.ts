import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OntologyLabels, ONTOLOGY_LABELS } from '../models/ontology-labels';

@Injectable({
  providedIn: 'root'
})
export class OntologyLabelsService {

  private labelsSubject = new BehaviorSubject<OntologyLabels>({...ONTOLOGY_LABELS});
  labels$ = this.labelsSubject.asObservable();

  getLabels(): OntologyLabels {
    return this.labelsSubject.value;
  }

  updateLabel(url: string, newLabel: string) {
    const updated = { ...this.getLabels(), [url]: newLabel };
    this.labelsSubject.next(updated);
  }

  addOntology(url: string, label: string) {
    const updated = { ...this.getLabels(), [url]: label };
    this.labelsSubject.next(updated);
  }

  deleteOntology(url: string) {
    const updated = { ...this.getLabels() };
    delete updated[url];
    this.labelsSubject.next(updated);
  }

}