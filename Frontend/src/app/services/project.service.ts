// src/app/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Project {
  name: string;
  description?: string;
  created?: string;
  modified?: string;
  open: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private apiUrl = 'http://localhost:8080/api';

  private currentProjectSubject = new BehaviorSubject<Project | null>(null);
  public currentProject$ = this.currentProjectSubject.asObservable();

  constructor(private http: HttpClient) {}

  listProjects(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/projects`);
  }

  openProject(name: string, description: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/projects/open`, {
      name,
      persistent: true,
      description
    }).pipe(
      tap(() => this.getCurrentProject().subscribe())
    );
  }

  getCurrentProject(): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/projects/current`).pipe(
      tap(project => {
        this.currentProjectSubject.next(project.open ? project : null);
      })
    );
  }

  closeProject(): Observable<any> {
    return this.http.post(`${this.apiUrl}/projects/close`, {}).pipe(
      tap(() => this.currentProjectSubject.next(null))
    );
  }
}
