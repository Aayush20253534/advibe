import test from "node:test";
import assert from "node:assert/strict";
import {safeAuthNext} from "../src/lib/auth-navigation.mjs";
test("redirect destinations must stay within the server-authenticated role",()=>{
 for(const role of ["admin","advertiser","driver"]){
  const root="/"+role;
  assert.equal(safeAuthNext(null,role),root);
  assert.equal(safeAuthNext(root+"/campaigns?tab=open",role),root+"/campaigns?tab=open");
  for(const invalid of ["https://evil.example","//evil.example",root+"/../admin",
   root+"/%2e%2e/admin",root+"/%5cevil",root+"\\a","/other","/unknown"])
   assert.equal(safeAuthNext(invalid,role),root);
  for(const other of ["admin","driver","advertiser"].filter(x=>x!==role))
   assert.equal(safeAuthNext("/"+other,role),root);
 }
 assert.equal(safeAuthNext("/admin","not-a-role"),"/login");
});
