export  interface Entity {
    id: string;
    titre: string;
    date: string;
    source: string;
    statut: 'complet' | 'partiel';
    type: 'Event' | 'Person' | 'Record' | 'Instantiation' | 'Agent' | 'Place' | 'Record Resource';
    birthDate?: string;
    deathDate?: string;
    associatedWith?: any[];
    associations? : Association[];
}

export interface EntityType {
  name: string;
  icon: string;
  count: number;
  type: Entity['type'];
}

export interface Association {
    predicate : string;
    object : string;
}

export const allEntities: Entity[] = [
    {
      id: '1',
      titre: 'Marie Curie',
      date: '1867-11-07',
      source: 'Manuel',
      statut: 'complet',
      type: 'Person',
      birthDate: '07/11/1867',
      deathDate: '04/07/1934',
      associatedWith: [2, 11]
    },
    {
      id: '2',
      titre: 'Pierre Curie',
      date: '1859-05-15',
      source: 'Manuel',
      statut: 'partiel',
      type: 'Person',
      birthDate: '15/05/1859',
      deathDate: '19/04/1906',
      associatedWith: [1]
    },
    {
      id: '3',
      titre: 'Découverte du Radium',
      date: '1898-12-26',
      source: 'Archives scientifiques',
      statut: 'complet',
      type: 'Event'
    },
    {
      id: '4',
      titre: 'Laboratoire Curie',
      date: '1914-07-31',
      source: 'Archives institutionnelles',
      statut: 'complet',
      type: 'Place'
    },
    {
      id: '5',
      titre: 'Notes de recherche 1898',
      date: '1898-01-01',
      source: 'Automatique',
      statut: 'partiel',
      type: 'Record'
    },
    {
      id: '6',
      titre: 'Prix Nobel de Physique',
      date: '1903-12-10',
      source: 'Archives Nobel',
      statut: 'complet',
      type: 'Event'
    },
    {
      id: '7',
      titre: 'Institut Curie',
      date: '1909-01-01',
      source: 'Archives institutionnelles',
      statut: 'complet',
      type: 'Agent'
    },
    {
      id: '8',
      titre: 'Manuscrit original - Radioactivité',
      date: '1902-05-15',
      source: 'Bibliothèque nationale',
      statut: 'complet',
      type: 'Instantiation'
    },
    {
      id: '9',
      titre: 'Correspondance scientifique',
      date: '1900-01-01',
      source: 'Automatique',
      statut: 'partiel',
      type: 'Record Resource'
    },
    {
      id: '10',
      titre: 'Photographie de laboratoire',
      date: '1905-03-20',
      source: 'Manuel',
      statut: 'complet',
      type: 'Instantiation'
    },
    {
      id: '11',
      titre: 'Irène Joliot-Curie',
      date: '1897-09-12',
      source: 'Manuel',
      statut: 'complet',
      type: 'Person',
      birthDate: '12/09/1897',
      deathDate: '17/03/1956',
      associatedWith: ['Marie Curie', 'Frédéric Joliot-Curie']
    },
    {
      id: '12',
      titre: 'Université de Paris',
      date: '1896-01-01',
      source: 'Archives universitaires',
      statut: 'complet',
      type: 'Place'
    },
    {
      id: '13',
      titre: 'Journal de recherche 1903',
      date: '1903-06-15',
      source: 'Automatique',
      statut: 'partiel',
      type: 'Record'
    }
  ];