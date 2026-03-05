// CORRECTION : Remplacement de DataSourceMockService par DataSourceService (vrai backend)
// Fichier : src/app/components/gestion-sources/gestion-sources.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// ✅ CORRECTION : Utiliser le vrai service (pas le Mock)
import { DataSourceService } from '../../services/data-source.service';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './gestion-sources.component.html',
  styleUrl: './gestion-sources.component.scss'
})
export class GestionSourcesComponent implements OnInit, OnDestroy {
  dataSources: DataSource[] = [];
  displayedColumns: string[] = ['name', 'shortName', 'type', 'description', 'actions'];

  showForm = false;
  isEditing = false;
  isLoading = false;  // ✅ Ajout d'un indicateur de chargement
  currentEditId: string | null = null;
  expandedHistory: string | null = null;

  dataSourceForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    // ✅ CORRECTION PRINCIPALE : DataSourceService au lieu de DataSourceMockService
    private dataSourceService: DataSourceService,
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
    this.isLoading = true;
    this.dataSourceService.getAllDataSources()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sources) => {
          this.dataSources = sources;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.showNotification('Erreur de connexion au backend (localhost:8080). Vérifiez que le serveur Spring Boot est démarré.', 'error');
          console.error('Erreur backend:', error);
        }
      });
  }

  openCreateForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentEditId = null;
    this.dataSourceForm.reset({ sourceType: 'INTERNAL' });
  }

  openEditForm(dataSource: DataSource): void {
    if (dataSource.editable === false) {
      this.showNotification('Les sources externes ne peuvent pas être éditées. Modifiez-les dans l\'application source et ré-importez.', 'warning');
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
      this.showNotification('Veuillez remplir tous les champs obligatoires', 'error');
    }
  }

  createDataSource(data: CreateDataSourceRequest): void {
    this.dataSourceService.createDataSource(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.showNotification(`Source de données créée : ${created.graphIRI}`, 'success');
          this.cancelForm();
        },
        error: (error) => {
          this.showNotification('Erreur lors de la création de la source de données', 'error');
          console.error('Erreur:', error);
        }
      });
  }

  updateDataSource(id: string, data: Partial<DataSource>): void {
    this.dataSourceService.updateDataSource(id, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showNotification('Source de données mise à jour', 'success');
          this.cancelForm();
        },
        error: (error) => {
          this.showNotification('Erreur lors de la mise à jour', 'error');
          console.error('Erreur:', error);
        }
      });
  }

  deleteDataSource(dataSource: DataSource): void {
    const message = dataSource.sourceType === 'EXTERNAL'
      ? `Supprimer le graphe nommé "${dataSource.graphIRI}" et toutes les données importées de ${dataSource.tool} ?`
      : `Supprimer "${dataSource.name}" et son graphe nommé ?`;

    if (confirm(message)) {
      this.dataSourceService.deleteDataSource(dataSource.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('Source de données supprimée', 'success');
          },
          error: (error) => {
            this.showNotification('Erreur lors de la suppression', 'error');
            console.error('Erreur:', error);
          }
        });
    }
  }

  reimportSource(dataSource: DataSource): void {
    if (dataSource.sourceType !== 'EXTERNAL' || !dataSource.url) return;

    if (confirm(`Ré-importer les données depuis ${dataSource.url} ?`)) {
      this.showNotification('Ré-importation en cours...', 'info');
      this.dataSourceService.syncExternalSource(dataSource.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification(`Données ré-importées depuis ${dataSource.tool || 'la source externe'}`, 'success');
            this.loadDataSources();
          },
          error: (error) => {
            this.showNotification('Erreur lors de la ré-importation', 'error');
            console.error('Erreur:', error);
          }
        });
    }
  }

  toggleHistory(sourceId: string): void {
    this.expandedHistory = this.expandedHistory === sourceId ? null : sourceId;
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
