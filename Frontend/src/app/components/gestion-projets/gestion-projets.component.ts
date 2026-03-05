// src/app/components/gestion-projets/gestion-projets.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService, Project } from '../../services/project.service';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-gestion-projets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatListModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './gestion-projets.component.html',
  styleUrl: './gestion-projets.component.scss'
})
export class GestionProjetsComponent implements OnInit {

  // Liste des projets existants sur disque
  existingProjects: string[] = [];

  // Projet actuellement ouvert
  currentProject: Project | null = null;

  // Formulaire création
  showCreateForm = false;
  newProjectName = '';
  newProjectDescription = '';
  isLoading = false;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadCurrentProject();
  }

  loadProjects(): void {
    this.projectService.listProjects().subscribe({
      next: (projects) => { this.existingProjects = projects; },
      error: () => { this.showNotif('Impossible de charger les projets', 'error'); }
    });
  }

  loadCurrentProject(): void {
    this.projectService.getCurrentProject().subscribe({
      next: (project) => { this.currentProject = project.open ? project : null; },
      error: () => { this.currentProject = null; }
    });
  }

  // Ouvrir un projet existant depuis la liste
  openExistingProject(name: string): void {
    this.isLoading = true;
    this.projectService.openProject(name, '').subscribe({
      next: () => {
        this.isLoading = false;
        this.currentProject = { name, open: true };
        this.showNotif(`Projet "${name}" ouvert !`, 'success');
      },
      error: () => {
        this.isLoading = false;
        this.showNotif('Erreur lors de l\'ouverture', 'error');
      }
    });
  }

  // Créer un nouveau projet
  createProject(): void {
    if (!this.newProjectName.trim()) {
      this.showNotif('Le nom du projet est obligatoire', 'error');
      return;
    }
    this.isLoading = true;
    this.projectService.openProject(this.newProjectName.trim(), this.newProjectDescription).subscribe({
      next: () => {
        this.isLoading = false;
        this.currentProject = { name: this.newProjectName.trim(), open: true };
        this.showNotif(`Projet "${this.newProjectName}" créé et ouvert !`, 'success');
        this.loadProjects(); // Rafraîchir la liste
        this.cancelCreate();
      },
      error: () => {
        this.isLoading = false;
        this.showNotif('Erreur lors de la création', 'error');
      }
    });
  }

  closeProject(): void {
    this.projectService.closeProject().subscribe({
      next: () => {
        this.currentProject = null;
        this.showNotif('Projet fermé', 'success');
      },
      error: () => { this.showNotif('Erreur lors de la fermeture', 'error'); }
    });
  }

  goToSources(): void {
    this.router.navigate(['/gestion-sources']);
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.newProjectName = '';
    this.newProjectDescription = '';
  }

  private showNotif(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'error' ? 'snackbar-error' : 'snackbar-success'
    });
  }
}
