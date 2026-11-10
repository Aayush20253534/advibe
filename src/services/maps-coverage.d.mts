export interface CoverageZone {
 id:string;
 name:string;
 centerLat:number;
 centerLng:number;
 radiusMeters:number;
}
export interface CoverageLocation {
 zoneId?:string;
 lat:number;
 lng:number;
}
export function coverageForLocation(location:CoverageLocation|undefined|null,zones:CoverageZone[]):CoverageZone|null;
export function formatCoverageRadius(metres:number):string;
