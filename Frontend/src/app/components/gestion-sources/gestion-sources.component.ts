// src/app/components/gestion-sources/gestion-sources.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DataSourceService } from '../../services/data-source.service';
import { DataSourceMockService } from '../../services/data-source-mock.service';
import { DataSource, CreateDataSourceRequest } from '../../models/data-source.model';

// Angular Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-gestion-sources',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './gestion-sources.component.html',
  styleUrl: './gestion-sources.component.scss'
})
export class GestionSourcesComponent implements OnInit, OnDestroy {
  dataSources: DataSource[] = [];
  selectedDataSource: DataSource | null = null;
  expandedHistory: string | null = null;
  
  showForm = false;
  isEditing = false;
  currentEditId: string | null = null;
  
  dataSourceForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private dataSourceService: DataSourceMockService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.dataSourceForm = this.fb.group({
      shortName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
      name: ['', Validators.required],
      description: [''],
      sourceType: ['INTERNAL', Validators.required],
      url: [''],
      tool: ['']
    });
  }

  ngOnInit(): void {
    this.loadDataSources();
    
    this.dataSourceService.dataSources$
      .pipe(takeUntil(this.destroy$))
      .subscribe(sources => {
        this.dataSources = sources;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDataSources(): void {
    this.dataSourceService.getAllDataSources()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sources) => {
          this.dataSources = sources;
        },
        error: (error) => {
          this.showNotification('Erreur lors du chargement des sources', 'error');
          console.error('Error:', error);
        }
      });
  }

  openCreateForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentEditId = null;
    this.selectedDataSource = null;
    this.dataSourceForm.reset({ sourceType: 'INTERNAL' });
  }

  openEditForm(dataSource: DataSource): void {
    if (dataSource.editable === false) {
      this.showNotification('Les sources externes ne peuvent pas être éditées. Éditez dans l\'outil source et réimportez.', 'warning');
      return;
    }

    this.showForm = true;
    this.isEditing = true;
    this.currentEditId = dataSource.id || null;
    
    this.dataSourceForm.patchValue({
      shortName: dataSource.shortName,
      name: dataSource.name,
      description: dataSource.description,
      sourceType: dataSource.sourceType,
      url: dataSource.url || '',
      tool: dataSource.tool || ''
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentEditId = null;
    this.dataSourceForm.reset({ sourceType: 'INTERNAL' });
  }

  onSubmit(): void {
    if (this.dataSourceForm.valid) {
      const formValue = this.dataSourceForm.value;
      
      if (this.isEditing && this.currentEditId) {
        this.updateDataSource(this.currentEditId, formValue);
      } else {
        this.createDataSource(formValue);
      }
    } else {
      this.showNotification('Veuillez remplir tous les champs requis', 'error');
    }
  }

  createDataSource(data: CreateDataSourceRequest): void {
    this.dataSourceService.createDataSource(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.showNotification(
            `Source créée avec le graphe nommé: ${created.graphIRI}`, 
            'success'
          );
          this.cancelForm();
        },
        error: (error) => {
          this.showNotification('Erreur lors de la création', 'error');
          console.error('Error:', error);
        }
      });
  }

  updateDataSource(id: string, data: Partial<DataSource>): void {
    this.dataSourceService.updateDataSource(id, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.showNotification('Source mise à jour avec succès', 'success');
          this.cancelForm();
        },
        error: (error) => {
          this.showNotification('Erreur lors de la mise à jour', 'error');
          console.error('Error:', error);
        }
      });
  }

  deleteDataSource(dataSource: DataSource): void {
    const message = dataSource.sourceType === 'EXTERNAL' 
      ? `Supprimer le graphe nommé "${dataSource.graphIRI}" et toutes les données importées de ${dataSource.tool}?`
      : `Supprimer "${dataSource.name}" et son graphe nommé?`;
    
    if (confirm(message)) {
      this.dataSourceService.deleteDataSource(dataSource.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('Source et graphe nommé supprimés', 'success');
            if (this.selectedDataSource?.id === dataSource.id) {
              this.selectedDataSource = null;
            }
          },
          error: (error) => {
            this.showNotification('Erreur lors de la suppression', 'error');
            console.error('Error:', error);
          }
        });
    }
  }

  reimportSource(dataSource: DataSource): void {
    if (dataSource.sourceType !== 'EXTERNAL' || !dataSource.url) {
      return;
    }

    const confirmMsg = `Réimporter les données depuis ${dataSource.url}?\n\nCeci va:\n- Supprimer le graphe nommé actuel\n- Importer les données fraîches du fichier RDF\n- Mettre à jour la date d'import`;
    
    if (confirm(confirmMsg)) {
      this.showNotification('Réimportation en cours...', 'info');
      
      this.dataSourceService.syncExternalSource(dataSource.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification(
              `Données réimportées depuis ${dataSource.tool || 'source externe'}`, 
              'success'
            );
            this.loadDataSources();
          },
          error: (error) => {
            this.showNotification('Erreur lors du réimport', 'error');
            console.error('Error:', error);
          }
        });
    }
  }

  selectDataSource(source: DataSource): void {
    this.selectedDataSource = source;
    this.showForm = false;
  }

  closeDetail(): void {
    this.selectedDataSource = null;
  }

  toggleHistory(sourceId: string): void {
    this.expandedHistory = this.expandedHistory === sourceId ? null : sourceId;
  }

  copyToClipboard(text: string | undefined): void {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('Copié dans le presse-papiers', 'success');
    }).catch(err => {
      console.error('Erreur lors de la copie:', err);
      this.showNotification('Erreur lors de la copie', 'error');
    });
  }

  isExternal(): boolean {
    return this.dataSourceForm.get('sourceType')?.value === 'EXTERNAL';
  }

  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: type === 'error' ? 5000 : 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: `snackbar-${type}`
    });
  }
}