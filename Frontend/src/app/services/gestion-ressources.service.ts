import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ONTOLOGY_LABELS } from '../models/ontology-labels';

@Injectable({
  providedIn: 'root'
})
export class GestionRessourcesService {
  private apiUrl = 'http://localhost:8080/sparql';
  private ontologyUrl = 'http://localhost:8080/ontology';
  private rdfUrl = 'http://localhost:8080/rdf';
  constructor(private http: HttpClient) { }

  getOntologyLabel(listeIris : string[] ) : any[] {
    const ontology_types: any[] = [];
    let ns = "";
    for (let typeIri of listeIris) {
      if (typeIri.includes('#')) {

        ns = typeIri.substring(0, typeIri.lastIndexOf('#') + 1);
      }
      else {
        ns = typeIri.substring(0, typeIri.lastIndexOf('/') + 1);
      }

      const elt = ns in ONTOLOGY_LABELS ? ONTOLOGY_LABELS[ns as keyof typeof ONTOLOGY_LABELS] : ns;
      let obj = ontology_types.find(o => elt in o);

      if (!obj) {
        obj = { [elt]: [] };
        ontology_types.push(obj);
      }

      obj[elt].push(typeIri.substring(typeIri.lastIndexOf('#')+1, typeIri.length));
    }

    return ontology_types;
        
  }


  getOntologyLabel_v2(listeIris : string[]) : string[] {
    const labels: string[] = [];
    for (let typeIri of listeIris) {
      const ns : string = typeIri.includes('#') 
        ? typeIri.substring(0, typeIri.lastIndexOf('#') + 1)
        : typeIri.substring(0, typeIri.lastIndexOf('/') + 1);
        labels.push(ns in ONTOLOGY_LABELS ? ONTOLOGY_LABELS[ns as keyof typeof ONTOLOGY_LABELS] : ns);
    }
    return labels;
  }

  getTypes(): Observable<any> {
    return this.http.get<any>(`${this.ontologyUrl}/types`);  
  }

  getTypeUrlByName(ontologyName: string): string {
    const entry = Object.entries(ONTOLOGY_LABELS).find(([_, label]) => label === ontologyName);
    return entry ? entry[0] : '';
  }

  getAllEntitiesByType(typeUrl: string): Observable<any> {
    const params = new HttpParams().set('type', typeUrl);
    return this.http.get<any>(`${this.rdfUrl}/entities`, {params});
  }
  // getTypes(): Observable<any> {

  //   const object = {
  //     query: "SELECT DISTINCT ?type WHERE { ?s rdf:type ?type }"
  //   };
  //   return this.http.post<any>(
  //   `${this.apiUrl}/select`,
  //   object,
  //   {
  //     headers: {
  //       'Content-Type': 'application/json'
  //     }
  //   }
  //   );  
  // }
}
