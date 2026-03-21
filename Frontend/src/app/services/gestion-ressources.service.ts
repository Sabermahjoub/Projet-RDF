import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GestionRessourcesService {
  private apiUrl = 'http://localhost:8080/sparql';

  constructor(private http: HttpClient) { }

  getTypes(): Observable<any> {

    const object = {
      query: "SELECT DISTINCT ?type WHERE { ?s rdf:type ?type }"
    };
    return this.http.post<any>(
    `${this.apiUrl}/select`,
    object,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    );  
  }
}
