/** Only published zones received from the backend can produce a map boundary.
 * A zone radius is a planning reference, never a vehicle route or confirmed coverage.
 */
export function coverageForLocation(location,zones){
 if(!location||!Array.isArray(zones)||typeof location.zoneId!=="string")return null;
 if(typeof location.lat!=="number"||!Number.isFinite(location.lat)||Math.abs(location.lat)>90||
    typeof location.lng!=="number"||!Number.isFinite(location.lng)||Math.abs(location.lng)>180)return null;
 const zone=zones.find(item=>item?.id===location.zoneId);
 if(!zone||typeof zone.centerLat!=="number"||!Number.isFinite(zone.centerLat)||Math.abs(zone.centerLat)>90||
    typeof zone.centerLng!=="number"||!Number.isFinite(zone.centerLng)||Math.abs(zone.centerLng)>180||
    !Number.isInteger(zone.radiusMeters)||zone.radiusMeters<100||zone.radiusMeters>50000)return null;
 return zone;
}
export function formatCoverageRadius(metres){
 if(!Number.isInteger(metres)||metres<100||metres>50000)return "";
 return metres>=1000?new Intl.NumberFormat("en-IN",{maximumFractionDigits:2}).format(metres/1000)+" km":
  metres.toLocaleString("en-IN")+" m";
}
