import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, '../../kxsj_live_resources.json');
const out = join(__dirname, '../db/init/002_seed.sql');

const { data } = JSON.parse(readFileSync(src, 'utf8'));

function s(v) {
  if (v === null || v === undefined) return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}
function arr(v) {
  if (!v || v.length === 0) return "'{}'";
  return `ARRAY[${v.map(x => `'${String(x).replace(/'/g, "''")}'`).join(',')}]`;
}
function jsonb(v) {
  if (v === null || v === undefined) return 'NULL';
  return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
}
function num(v) {
  if (v === null || v === undefined) return 'NULL';
  return String(v);
}

const cols = [
  'source_id', 'resources_id', 'name', 'name_en',
  'description', 'detailed_description',
  'resource_type', 'resource_type_name', 'template_name',
  'subjects', 'keywords', 'authors',
  'organization_name', 'region', 'data_time',
  'doi', 'license', 'privacy_type', 'privacy_condition',
  'storage_num', 'file_count', 'structured_count',
  'visit_num', 'download_num', 'follow_num',
  'status', 'release_type', 'version', 'logo_url',
  'file_formats', 'suffix_storage',
  'corresponding_author_name', 'corresponding_author_email',
  'unit_name', 'unit_address', 'unit_postal_code',
  'approve_time', 'create_time',
].join(', ');

const lines = [
  `-- Auto-generated from kxsj_live_resources.json (${data.length} records)`,
  `INSERT INTO resources (${cols}) VALUES`,
];

const rows = data.map((r) => `  (${[
  s(r.source_id),
  s(r.resources_id),
  s(r.name),
  s(r.name_en),
  s(r.description),
  s(r.detailed_description),
  s(r.resource_type),
  s(r.resource_type_name),
  s(r.template_name),
  arr(r.subjects),
  arr(r.keywords),
  jsonb(r.authors),
  s(r.organization_name),
  s(r.region),
  s(r.data_time),
  s(r.doi),
  s(r.license),
  s(r.privacy_type),
  s(r.privacy_condition),
  num(r.storage_num),
  num(r.file_count),
  num(r.structured_count),
  num(r.visit_num ?? 0),
  num(r.download_num ?? 0),
  num(r.follow_num ?? 0),
  s(r.status),
  s(r.release_type),
  s(r.version),
  s(r.logo_url),
  jsonb(r.file_formats),
  jsonb(r.suffix_storage),
  s(r.corresponding_author_name),
  s(r.corresponding_author_email),
  s(r.unit_name),
  s(r.unit_address),
  s(r.unit_postal_code),
  s(r.approve_time),
  s(r.create_time),
].join(', ')})`);

lines.push(rows.join(',\n'));
lines.push('ON CONFLICT (source_id) DO NOTHING;');

writeFileSync(out, lines.join('\n') + '\n');
console.log(`Generated ${data.length} rows → ${out}`);
