import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OntologyLabelsService } from '../../services/ontology-labels.service';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-ontology-manager-dialog',
  templateUrl: './ontology-manager-dialog.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
})
export class OntologyManagerDialogComponent implements OnInit {

  ontologies: { url: string; label: string }[] = [];
  form: FormGroup;

  constructor(
    private ontologyService: OntologyLabelsService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OntologyManagerDialogComponent>
  ) {
    this.form = this.fb.group({
      url: [''],
      label: ['']
    });
  }

  ngOnInit() {
    this.ontologyService.labels$.subscribe(labels => {
      this.ontologies = Object.entries(labels).map(([url, label]) => ({
        url,
        label
      }));

      console.log("UPDATED LIST 👉", this.ontologies); // debug
    });
  }

  updateLabel(url: string, newLabel: string) {
    this.ontologyService.updateLabel(url, newLabel);
  }

  delete(url: string) {
    this.ontologyService.deleteOntology(url);
  }

  add() {
    const { url, label } = this.form.value;

    if (!url?.trim() || !label?.trim()) return;

    this.ontologyService.addOntology(url.trim(), label.trim());
    this.form.reset();
  }

  close(): void {
    this.dialogRef.close();
  }
}