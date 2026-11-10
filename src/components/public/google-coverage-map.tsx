"use client";

import {useEffect,useRef,useState} from "react";
import type {CoverageZone} from "@/services/maps-coverage.mjs";

type Point={lat:number;lng:number};
type MapHandle={fitBounds:(bounds:unknown,padding?:number)=>void};
type OverlayHandle={setMap:(map:null)=>void};
type CircleHandle=OverlayHandle&{getBounds:()=>unknown|null};
type MapsRuntime={
 Map:new (node:HTMLElement,options:{center:Point;zoom:number;mapTypeControl:boolean;streetViewControl:boolean;fullscreenControl:boolean})=>MapHandle;
 Circle:new (options:{map:MapHandle;center:Point;radius:number;strokeColor:string;strokeOpacity:number;strokeWeight:number;fillColor:string;fillOpacity:number;clickable:boolean})=>CircleHandle;
 Marker:new (options:{map:MapHandle;position:Point;title:string})=>OverlayHandle;
};
type MapsWindow=Window&{google?:{maps?:MapsRuntime};__bmaCoverageMapsReady?:()=>void};

let googleMapsLoader:Promise<MapsRuntime>|null=null;
let loadingKey:string|null=null;

/** Load only after the user explicitly opens the map. Never bill dynamic maps by default. */
function loadGoogleMaps(key:string):Promise<MapsRuntime>{
 const current=window as MapsWindow;
 if(current.google?.maps?.Map&&current.google.maps.Circle&&current.google.maps.Marker)
  return Promise.resolve(current.google.maps);
 if(googleMapsLoader){
  return loadingKey===key?googleMapsLoader:
   Promise.reject(new Error("A different Google Maps key is already loading"));
 }
 loadingKey=key;
 googleMapsLoader=new Promise<MapsRuntime>((resolve,reject)=>{
  const script=document.createElement("script");
  let settled=false;
  const timer=window.setTimeout(()=>fail(new Error("Google Maps did not load")),15000);
  function fail(reason:Error){
   if(settled)return;
   settled=true;
   window.clearTimeout(timer);
   delete current.__bmaCoverageMapsReady;
   script.remove();
   googleMapsLoader=null;
   loadingKey=null;
   reject(reason);
  }
  current.__bmaCoverageMapsReady=()=>{
   if(settled)return;
   const maps=current.google?.maps;
   if(!maps?.Map||!maps.Circle||!maps.Marker){
    fail(new Error("Google Maps JavaScript API is not enabled for this key"));
    return;
   }
   settled=true;
   window.clearTimeout(timer);
   delete current.__bmaCoverageMapsReady;
   resolve(maps);
  };
  script.async=true;
  script.defer=true;
  script.onerror=()=>fail(new Error("Google Maps JavaScript API could not be loaded"));
  script.src="https://maps.googleapis.com/maps/api/js?"+
   new URLSearchParams({key,v:"weekly",loading:"async",callback:"__bmaCoverageMapsReady"}).toString();
  document.head.appendChild(script);
 });
 return googleMapsLoader;
}

type Location={id:string;name:string;lat:number;lng:number};
export function GoogleCoverageMap({location,zone,apiKey,fallbackUrl}:{
 location:Location;zone:CoverageZone;apiKey:string;fallbackUrl:string;
}){
 const node=useRef<HTMLDivElement>(null);
 const map=useRef<MapHandle|null>(null);
 const [runtime,setRuntime]=useState<MapsRuntime|null>(null);
 const [mapCreated,setMapCreated]=useState(false);
 const [error,setError]=useState(false);
 useEffect(()=>{
  let active=true;
  void loadGoogleMaps(apiKey).then(value=>{if(active)setRuntime(value);})
   .catch(()=>{if(active)setError(true);});
  return ()=>{active=false;};
 },[apiKey]);
 useEffect(()=>{
  if(!runtime||!node.current)return;
  map.current=new runtime.Map(node.current,{
   center:{lat:zone.centerLat,lng:zone.centerLng},zoom:13,
   mapTypeControl:false,streetViewControl:false,fullscreenControl:true,
  });
  setMapCreated(true);
  return ()=>{map.current=null;};
 },[runtime]);
 useEffect(()=>{
  if(!mapCreated||!runtime||!map.current)return;
  const currentMap=map.current;
  const circle=new runtime.Circle({
   map:currentMap,
   center:{lat:zone.centerLat,lng:zone.centerLng},
   radius:zone.radiusMeters,
   strokeColor:"#125af4",strokeOpacity:0.94,strokeWeight:3,
   fillColor:"#125af4",fillOpacity:0.14,clickable:false,
  });
  const marker=new runtime.Marker({
   map:currentMap,position:{lat:location.lat,lng:location.lng},title:location.name,
  });
  const bounds=circle.getBounds();
  if(bounds)currentMap.fitBounds(bounds,36);
  return ()=>{circle.setMap(null);marker.setMap(null);};
 },[mapCreated,runtime,location.id,location.name,location.lat,location.lng,
  zone.id,zone.centerLat,zone.centerLng,zone.radiusMeters]);

 if(error)return <div className="space-y-2">
  <p role="alert" className="px-4 pt-3 text-sm text-ink-muted">
   The interactive boundary could not load. Check that Maps JavaScript API is enabled and the key allows this website. The basic map is shown below.
  </p>
  <iframe title={`Basic Google Maps view: ${location.name}`} src={fallbackUrl} loading="lazy"
   referrerPolicy="strict-origin-when-cross-origin" allowFullScreen className="h-80 w-full border-0"/>
 </div>;
 return <div className="relative">
  <div ref={node} role="img" aria-label={`Google Maps showing the configured ${zone.radiusMeters} metre boundary of ${zone.name} and the ${location.name} marker`}
   className="h-80 w-full bg-[#eaf1fc]"/>
  {!mapCreated&&<div role="status" className="pointer-events-none absolute inset-0 grid place-items-center bg-paper/85 text-sm text-ink-muted">
   Loading Google Maps coverage boundary…
  </div>}
 </div>;
}
