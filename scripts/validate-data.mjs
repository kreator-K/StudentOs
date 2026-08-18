import fs from "node:fs";
import { URL } from "node:url";

const root = new URL("../data/cornell/", import.meta.url);
const readJson = (name) => JSON.parse(fs.readFileSync(new URL(name, root), "utf8"));
const entities = readJson("entities.json");
const relationships = readJson("relationships.json");
const allowedDomains = new Set(["communities", "people", "events", "opportunities", "entrepreneurship", "student_built"]);
const allowedKinds = new Set(["organization", "network", "community", "service", "program", "opportunity", "event", "place", "student_resource"]);
const allowedSources = new Set(["official_university", "official_school_department", "cornellian_community", "student_built", "external"]);
const ids = new Set();
const errors = [];
const warnings = [];

for (const entity of entities) {
  if (!entity.id || ids.has(entity.id)) errors.push(`Duplicate or missing entity ID: ${entity.id || "(missing)"}`);
  ids.add(entity.id);
  for (const field of ["name", "kind", "shortDescription", "universityId", "source", "links"]) {
    if (!entity[field]) errors.push(`${entity.id}: missing required field ${field}`);
  }
  if (!allowedKinds.has(entity.kind)) errors.push(`${entity.id}: invalid kind ${entity.kind}`);
  if (!Array.isArray(entity.domains) || !entity.domains.length || entity.domains.some((domain) => !allowedDomains.has(domain))) errors.push(`${entity.id}: invalid domains`);
  if (!allowedSources.has(entity.source?.sourceType)) errors.push(`${entity.id}: invalid source type`);
  if (!entity.source?.sourceUrl) errors.push(`${entity.id}: missing source URL`);
  if (entity.source?.sourceUrl) { try { const url = new URL(entity.source.sourceUrl); if (!/^https?:$/.test(url.protocol)) errors.push(`${entity.id}: source URL is not HTTP(S)`); } catch { errors.push(`${entity.id}: malformed source URL`); } }
  if (!Array.isArray(entity.links) || !entity.links.length || !entity.links.some((link) => link.isPrimary)) errors.push(`${entity.id}: missing primary link`);
  for (const link of entity.links || []) { try { const url = new URL(link.url); if (!/^https?:$/.test(url.protocol)) errors.push(`${entity.id}: malformed link URL`); } catch { errors.push(`${entity.id}: malformed link URL`); } }
  if (!entity.lastVerifiedAt) warnings.push(`${entity.id}: missing lastVerifiedAt`);
}

const relationshipIds = new Set();
for (const relationship of relationships) {
  if (!relationship.id || relationshipIds.has(relationship.id)) errors.push(`Duplicate or missing relationship ID: ${relationship.id || "(missing)"}`);
  relationshipIds.add(relationship.id);
  if (!ids.has(relationship.fromEntityId) || !ids.has(relationship.toEntityId)) errors.push(`${relationship.id}: orphaned entity reference`);
  if (!relationship.type || !relationship.confidence) errors.push(`${relationship.id}: missing type or confidence`);
  if (relationship.confidence === "medium") warnings.push(`${relationship.id}: medium-confidence relationship requires human review before authoritative copy`);
}

if (errors.length) { console.error(errors.map((error) => `ERROR ${error}`).join("\n")); process.exit(1); }
console.log(`Validated ${entities.length} entities and ${relationships.length} relationships.`);
console.log(`Warnings: ${warnings.length}`);
if (warnings.length) console.log(warnings.map((warning) => `WARN ${warning}`).join("\n"));
