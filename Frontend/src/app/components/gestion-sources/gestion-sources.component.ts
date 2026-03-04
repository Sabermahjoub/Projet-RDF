// src/app/components/gestion-sources/gestion-sources.component-v2.ts

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
  displayedColumns: string[] = ['name', 'shortName', 'type', 'description', 'actions'];
  
  showForm = false;
  isEditing = false;
  currentEditId: string | null = null;
  expandedHistory: string | null = null; // Track which source's history is expanded
  
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
    
    // Subscribe to data sources changes
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
          this.showNotification('Error loading data sources', 'error');
          console.error('Error:', error);
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
    // Cannot edit external sources (only metadata like name/description)
    if (dataSource.editable === false) {
      this.showNotification('External sources cannot be edited. Edit in the source application and re-import.', 'warning');
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
      this.showNotification('Please fill in all required fields', 'error');
    }
  }

  createDataSource(data: CreateDataSourceRequest): void {
    this.dataSourceService.createDataSource(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.showNotification(
            `Data source created with named graph: ${created.graphIRI}`, 
            'success'
          );
          this.cancelForm();
        },
        error: (error) => {
          this.showNotification('Error creating data source', 'error');
          console.error('Error:', error);
        }
      });
  }

  updateDataSource(id: string, data: Partial<DataSource>): void {
    this.dataSourceService.updateDataSource(id, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.showNotification('Data source metadata updated successfully', 'success');
          this.cancelForm();
        },
        error: (error) => {
          this.showNotification('Error updating data source', 'error');
          console.error('Error:', error);
        }
      });
  }

  deleteDataSource(dataSource: DataSource): void {
    const message = dataSource.sourceType === 'EXTERNAL' 
      ? `This will delete the named graph "${dataSource.graphIRI}" and all imported data from ${dataSource.tool}. Are you sure?`
      : `This will delete "${dataSource.name}" and its named graph. Are you sure?`;
    
    if (confirm(message)) {
      this.dataSourceService.deleteDataSource(dataSource.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('Data source and named graph deleted successfully', 'success');
          },
          error: (error) => {
            this.showNotification('Error deleting data source', 'error');
            console.error('Error:', error);
          }
        });
    }
  }

  reimportSource(dataSource: DataSource): void {
    if (dataSource.sourceType !== 'EXTERNAL' || !dataSource.url) {
      return;
    }

    const confirmMsg = `Re-import data from ${dataSource.url}?\n\nThis will:\n- Delete the current named graph\n- Import fresh data from the RDF file\n- Update the import date`;
    
    if (confirm(confirmMsg)) {
      this.showNotification('Re-importing data...', 'info');
      
      this.dataSourceService.syncExternalSource(dataSource.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification(
              `Successfully re-imported data from ${dataSource.tool || 'external source'}`, 
              'success'
            );
            this.loadDataSources();
          },
          error: (error) => {
            this.showNotification('Error re-importing data', 'error');
            console.error('Error:', error);
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
    this.snackBar.open(message, 'Close', {
      duration: type === 'error' ? 5000 : 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: `snackbar-${type}`
    });
  }
}