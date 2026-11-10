import assert from "node:assert/strict";
import test from "node:test";
import {coverageForLocation,formatCoverageRadius} from "../src/services/maps-coverage.mjs";
import {validateMapsConfig} from "../src/services/maps-embed.mjs";

const civilLines={id:"zone-civil",name:"Civil Lines",centerLat:25.4523,centerLng:81.833,radiusMeters:2000};
const loc={zoneId:"zone-civil",lat:25.4523,lng:81.833};
test("the published location references its real configured zone circle",()=>{
 assert.deepEqual(coverageForLocation(loc,[civilLines]),civilLines);
 assert.equal(formatCoverageRadius(2000),"2 km");
 assert.equal(formatCoverageRadius(1250),"1.25 km");
 assert.equal(formatCoverageRadius(700),"700 m");
});
test("no circle is invented for missing or invalid zone data",()=>{
 assert.equal(coverageForLocation(loc,[]),null);
 assert.equal(coverageForLocation({...loc,zoneId:"another-zone"},[civilLines]),null);
 assert.equal(coverageForLocation(loc,[{...civilLines,radiusMeters:0}]),null);
 assert.equal(coverageForLocation(loc,[{...civilLines,radiusMeters:55000}]),null);
 assert.equal(coverageForLocation(loc,[{...civilLines,centerLat:NaN}]),null);
 assert.equal(coverageForLocation({...loc,lat:99},[civilLines]),null);
 assert.equal(formatCoverageRadius(-1),"");
});
test("interactive billable maps must be explicitly enabled and configured",()=>{
 const embed={NEXT_PUBLIC_GOOGLE_MAPS_ENABLED:"true",NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY:"embed-key"};
 assert.doesNotThrow(()=>validateMapsConfig(embed));
 assert.doesNotThrow(()=>validateMapsConfig({...embed,NEXT_PUBLIC_GOOGLE_MAPS_COVERAGE_ENABLED:"false"}));
 assert.throws(()=>validateMapsConfig({...embed,NEXT_PUBLIC_GOOGLE_MAPS_COVERAGE_ENABLED:"true"}),/NEXT_PUBLIC_GOOGLE_MAPS_JS_KEY/);
 assert.throws(()=>validateMapsConfig({...embed,NEXT_PUBLIC_GOOGLE_MAPS_COVERAGE_ENABLED:"TRUE",NEXT_PUBLIC_GOOGLE_MAPS_JS_KEY:"js-key"}),/NEXT_PUBLIC_GOOGLE_MAPS_COVERAGE_ENABLED/);
 assert.throws(()=>validateMapsConfig({...embed,NEXT_PUBLIC_GOOGLE_MAPS_ENABLED:"false",NEXT_PUBLIC_GOOGLE_MAPS_COVERAGE_ENABLED:"true",NEXT_PUBLIC_GOOGLE_MAPS_JS_KEY:"js-key"}),/NEXT_PUBLIC_GOOGLE_MAPS_ENABLED/);
 assert.doesNotThrow(()=>validateMapsConfig({...embed,NEXT_PUBLIC_GOOGLE_MAPS_COVERAGE_ENABLED:"true",NEXT_PUBLIC_GOOGLE_MAPS_JS_KEY:"js-key"}));
});
