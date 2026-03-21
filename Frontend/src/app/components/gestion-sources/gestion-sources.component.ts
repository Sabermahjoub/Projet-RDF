import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
 
import { DataSourceService } from '../../services/data-source.service';
import { DataSourceHttpService } from '../../services/data-source-http.service';
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
//import { MatMenuModule } from '@angular/material/menu';
 
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
    //MatMenuModule
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

  //Props pour les filtres
  showFilterMenu = false;
  filterType: 'ALL' | 'INTERNAL' | 'EXTERNAL' = 'ALL';
  filterTool: string = 'ALL';
  searchTerm: string = '';

  //props pour les stats
  showExportMenu = false;
 
  constructor(
    private dataSourceService: DataSourceHttpService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    // Création du formulaire
    this.dataSourceForm = this.fb.group({
      shortName: ['', [
        Validators.required, 
        Validators.pattern(/^[a-zA-Z0-9_-]+$/)
      ]],
      name: ['', Validators.required],
      description: [''],
      sourceType: ['INTERNAL', Validators.required],
      url: [''],
      tool: ['']
    });
  }
 
  ngOnInit(): void {
    // ✅ Configure la validation conditionnelle
    this.setupConditionalValidation();
    
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
 
  /**
   * ✅ Configure la validation conditionnelle pour tool et url
   */
  private setupConditionalValidation(): void {
    this.dataSourceForm.get('sourceType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        const toolControl = this.dataSourceForm.get('tool');
        const urlControl = this.dataSourceForm.get('url');
 
        if (type === 'EXTERNAL') {
          // Source externe: tool et url obligatoires
          toolControl?.setValidators([Validators.required]);
          urlControl?.setValidators([Validators.required, Validators.minLength(5)]);
          
          console.log('✅ Validation EXTERNAL activée: tool et url requis');
        } else {
          // Source interne: pas de tool ni url
          toolControl?.clearValidators();
          urlControl?.clearValidators();
          
          // Vide les champs
          toolControl?.setValue('');
          urlControl?.setValue('');
          
          console.log('✅ Validation INTERNAL: tool et url non requis');
        }
 
        // Applique les changements
        toolControl?.updateValueAndValidity();
        urlControl?.updateValueAndValidity();
      });
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
 
    // Détermine le type par défaut selon la contrainte
    if (!this.canCreateInternalSource()) {
      this.dataSourceForm.reset({ sourceType: 'EXTERNAL' });
      console.log('⚠️ Source INTERNAL existe → Formulaire en mode EXTERNAL');
    } else {
      this.dataSourceForm.reset({ sourceType: 'INTERNAL' });
      console.log('✅ Aucune source INTERNAL → Formulaire en mode INTERNAL');
    }
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
    // Marque tous les champs comme "touchés" pour afficher les erreurs
    this.dataSourceForm.markAllAsTouched();
 
    if (this.dataSourceForm.valid) {
      const formValue = this.dataSourceForm.value;
      
      // Vérification contrainte INTERNAL
      if (formValue.sourceType === 'INTERNAL' && !this.canCreateInternalSource() && !this.isEditing) {
        this.showNotification('Une source de données interne existe déjà.', 'error');
        return;
      }
      
      //vérification external
      if (formValue.sourceType === 'EXTERNAL') {
        if (!formValue.tool || formValue.tool.trim() === '') {
          this.showNotification('L\'outil source est obligatoire pour les sources externes.', 'error');
          return;
        }
        if (!formValue.url || formValue.url.trim() === '') {
          this.showNotification('Le chemin du fichier RDF est obligatoire pour les sources externes.', 'error');
          return;
        }
      }
      
      if (this.isEditing && this.currentEditId) {
        this.updateDataSource(this.currentEditId, formValue);
      } else {
        this.createDataSource(formValue);
      }
    } else {
      // Message d'erreur détaillé
      const errors: string[] = [];
      
      if (this.dataSourceForm.get('shortName')?.invalid) {
        errors.push('Nom court');
      }
      if (this.dataSourceForm.get('name')?.invalid) {
        errors.push('Nom d\'affichage');
      }
      if (this.dataSourceForm.get('tool')?.invalid) {
        errors.push('Outil source');
      }
      if (this.dataSourceForm.get('url')?.invalid) {
        errors.push('Chemin fichier');
      }
      
      const errorMessage = errors.length > 0 
        ? `Champs manquants: ${errors.join(', ')}`
        : 'Veuillez remplir tous les champs requis';
      
      this.showNotification(errorMessage, 'error');
    }
  }
 
  createDataSource(data: CreateDataSourceRequest): void {
    const createObservable = data.sourceType === 'INTERNAL' 
      ? this.dataSourceService.createInternalSource(data)
      : this.dataSourceService.createExternalSource(data);
 
    createObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.showNotification(
            `Source créée: ${created.graphIRI}`, 
            'success'
          );
          this.cancelForm();
        },
        error: (error) => {
          this.showNotification(
            `Erreur: ${error.message}`, 
            'error'
          );
          console.error('Error:', error);
        }
      });
  }
 
  updateDataSource(shortName: string, data: Partial<DataSource>): void {
    this.dataSourceService.updateDataSource(shortName, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.showNotification('Source mise à jour', 'success');
          this.cancelForm();
        },
        error: (error) => {
          this.showNotification(
            `Erreur: ${error.message}`, 
            'error'
          );
        }
      });
  }
 
  deleteDataSource(dataSource: DataSource): void {
    const message = `Supprimer "${dataSource.name}" et son graphe nommé?`;
    
    if (confirm(message)) {
      this.dataSourceService.deleteDataSource(dataSource.shortName)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('Source supprimée', 'success');
            if (this.selectedDataSource?.id === dataSource.id) {
              this.selectedDataSource = null;
            }
          },
          error: (error) => {
            this.showNotification(
              `Erreur: ${error.message}`, 
              'error'
            );
          }
        });
    }
  }
 
  reimportSource(dataSource: DataSource): void {
    if (confirm(`Réimporter depuis ${dataSource.url}?`)) {
      this.dataSourceService.syncExternalSource(dataSource.shortName)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showNotification('Données réimportées', 'success');
          },
          error: (error) => {
            this.showNotification(
              `Erreur: ${error.message}`, 
              'error'
            );
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
 
  canCreateInternalSource(): boolean {
    const internalSources = this.dataSources.filter(s => 
      s.sourceType?.toUpperCase() === 'INTERNAL'
    );
    console.log('🔍 Sources internes:', internalSources.length);
    return internalSources.length === 0;
  }

  toggleFilterMenu(): void {
    this.showFilterMenu = !this.showFilterMenu;
    console.log('🔽 Menu filtre:', this.showFilterMenu ? 'ouvert' : 'fermé');
  }

  applyTypeFilter(type: 'ALL' | 'INTERNAL' | 'EXTERNAL'): void {
    this.filterType = type;
    console.log('🔍 Filtre type:', type);
  }

  applyToolFilter(tool: string): void {
    this.filterTool = tool;
    console.log('🔍 Filtre outil:', tool);
  }

  resetFilters(): void {
    this.filterType = 'ALL';
    this.filterTool = 'ALL';
    this.searchTerm = '';
    console.log('🔄 Filtres réinitialisés');
  }

  getFilteredSources(): DataSource[] {
    let filtered = [...this.dataSources];
    
    // Filtre par type
    if (this.filterType !== 'ALL') {
      filtered = filtered.filter(s => s.sourceType === this.filterType);
    }
    
    // Filtre par outil
    if (this.filterTool !== 'ALL') {
      filtered = filtered.filter(s => s.tool === this.filterTool);
    }
    
    // Recherche textuelle
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(term) ||
        s.shortName.toLowerCase().includes(term) ||
        (s.description && s.description.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }

  getAvailableTools(): string[] {
    return [...new Set(this.dataSources
      .filter(s => s.tool)
      .map(s => s.tool as string))];
  }

  // ===== MÉTHODES POUR BOUTON EXPORT =====
  exportAsJSON(): void {
    const data = this.getFilteredSources();
    const json = JSON.stringify(data, null, 2);
    
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `datasources-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    this.showNotification('Export JSON réussi', 'success');
  }

  exportAsCSV(): void {
    const data = this.getFilteredSources();
    
    // En-têtes CSV
    const headers = ['Nom Court', 'Nom', 'Type', 'Outil', 'Éditable', 'Graph IRI'];
    
    // Lignes CSV
    const rows = data.map(s => [
      s.shortName,
      s.name,
      s.sourceType,
      s.tool || '-',
      s.editable ? 'Oui' : 'Non',
      s.graphIRI
    ]);
    
    // Construction CSV
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Téléchargement
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `datasources-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    this.showNotification('Export CSV réussi', 'success');
  }

  exportConfiguration(): void {
    const config = {
      exportDate: new Date().toISOString(),
      totalSources: this.dataSources.length,
      sources: this.dataSources.map(s => ({
        shortName: s.shortName,
        name: s.name,
        description: s.description,
        type: s.sourceType,
        tool: s.tool,
        url: s.url,
        graphIRI: s.graphIRI,
        editable: s.editable
      }))
    };
    
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `datasources-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    this.showNotification('Export configuration réussi', 'success');
  }

  /**
 * Gère la sélection du fichier JSON
 */
onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  
  if (!input.files || input.files.length === 0) {
    return;
  }

  const file = input.files[0];
  
  // Vérifie que c'est bien un fichier JSON
  if (!file.name.endsWith('.json')) {
    this.showNotification('Le fichier doit être au format JSON', 'error');
    return;
  }

  // Lit le contenu du fichier
  const reader = new FileReader();
  
  reader.onload = (e: ProgressEvent<FileReader>) => {
    try {
      const content = e.target?.result as string;
      const config = JSON.parse(content);
      
      // Valide la structure
      if (!this.validateConfigStructure(config)) {
        this.showNotification('Format de configuration invalide', 'error');
        return;
      }

      // Demande confirmation
      this.confirmImport(config);
      
    } catch (error) {
      console.error('Erreur parsing JSON:', error);
      this.showNotification('Fichier JSON invalide', 'error');
    }
  };

  reader.onerror = () => {
    this.showNotification('Erreur lors de la lecture du fichier', 'error');
  };

  reader.readAsText(file);
  
  // Réinitialise l'input pour permettre de réimporter le même fichier
  input.value = '';
}

/**
 * Valide la structure du fichier de configuration
 */
private validateConfigStructure(config: any): boolean {
  // Vérifie que c'est un objet avec la propriété 'sources'
  if (!config || typeof config !== 'object') {
    return false;
  }

  // Accepte 2 formats:
  // Format 1: { sources: [...] }
  // Format 2: [...] (array direct)
  const sources = Array.isArray(config) ? config : config.sources;

  if (!Array.isArray(sources)) {
    return false;
  }

  // Vérifie que chaque source a au minimum un shortName et un name
  return sources.every((s: any) => 
    s && 
    typeof s === 'object' && 
    s.shortName && 
    s.name &&
    (s.type || s.sourceType) // Accepte les 2 noms de champ
  );
}

  /**
   * Demande confirmation avant import
   */
  private confirmImport(config: any): void {
    const sources = Array.isArray(config) ? config : config.sources;
    const count = sources.length;

    const message = `Voulez-vous importer ${count} source(s) ?\n\n` +
      `⚠️ Attention:\n` +
      `- Les sources avec le même shortName seront ignorées\n` +
      `- Seule 1 source INTERNAL peut exister\n` +
      `- Les sources EXTERNAL seront créées mais pas synchronisées automatiquement`;

    if (confirm(message)) {
      this.importConfiguration(sources);
    }
  }

  /**
   * Importe les sources depuis la configuration
   */
  private importConfiguration(sources: any[]): void {
    let successCount = 0;
    let errorCount = 0;
    let completedCount = 0; // ← NOUVEAU: Compte les requêtes terminées
    const errors: string[] = [];
    const totalSources = sources.length;

    // Compte le nombre de sources INTERNAL dans le fichier
    const internalSources = sources.filter(s => 
      (s.type || s.sourceType)?.toUpperCase() === 'INTERNAL'
    );

    // Vérifie la contrainte INTERNAL
    if (internalSources.length > 1) {
      this.showNotification(
        `❌ Le fichier contient ${internalSources.length} sources INTERNAL. Seule 1 est autorisée.`,
        'error'
      );
      return;
    }

    if (internalSources.length === 1 && !this.canCreateInternalSource()) {
      this.showNotification(
        '❌ Une source INTERNAL existe déjà. Supprimez-la avant d\'importer.',
        'error'
      );
      return;
    }

    // Affiche notification de démarrage
    this.showNotification(`🔄 Import de ${totalSources} source(s) en cours...`, 'info');

    // Import de chaque source
    sources.forEach((source) => {
      const sourceType = (source.type || source.sourceType)?.toUpperCase();

      const request: CreateDataSourceRequest = {
        shortName: source.shortName,
        name: source.name,
        description: source.description || '',
        sourceType: sourceType as 'INTERNAL' | 'EXTERNAL',
        url: source.url || undefined,
        tool: source.tool || undefined
      };

      const createObservable = sourceType === 'INTERNAL'
        ? this.dataSourceService.createInternalSource(request)
        : this.dataSourceService.createExternalSource(request);

      createObservable
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (created) => {
            successCount++;
            completedCount++;
            console.log(`✅ Source importée: ${created.name}`);

            // ✅ CORRECTION: Vérifie si TOUTES les requêtes sont terminées
            if (completedCount === totalSources) {
              this.showImportSummary(successCount, errorCount, errors);
            }
          },
          error: (error) => {
            errorCount++;
            completedCount++;
            const errorMsg = `${source.shortName}: ${error.message || 'Erreur inconnue'}`;
            errors.push(errorMsg);
            console.error(`❌ Erreur import ${source.shortName}:`, error);

            // ✅ CORRECTION: Vérifie si TOUTES les requêtes sont terminées
            if (completedCount === totalSources) {
              this.showImportSummary(successCount, errorCount, errors);
            }
          }
        });
    });
  }

  /**
   * Affiche un résumé de l'import
   */
  private showImportSummary(successCount: number, errorCount: number, errors: string[]): void {
    if (errorCount === 0) {
      this.showNotification(
        `✅ Import réussi ! ${successCount} source(s) créée(s)`,
        'success'
      );
    } else {
      const message = `⚠️ Import partiel:\n` +
        `✅ ${successCount} réussie(s)\n` +
        `❌ ${errorCount} échouée(s)\n\n` +
        `Erreurs:\n${errors.join('\n')}`;
      
      console.error('Erreurs d\'import:', errors);
      this.showNotification(message, 'warning');
    }
  }
}