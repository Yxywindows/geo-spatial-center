export interface Author {
  '@type': string
  name: string
  en_name?: string
  '@id'?: string
  email?: string
  Organization?: {
    '@type': string
    name: string
    en_name?: string
    '@id'?: string
  }
}

export interface FileFormat {
  name: string
  count: number
}

export interface SuffixStorage {
  name: string
  storageNum: number
}

export interface Resource {
  id: number
  source_id: string
  resources_id?: string
  name: string
  name_en?: string
  description?: string
  detailed_description?: string
  resource_type?: string
  resource_type_name?: string
  template_name?: string
  subjects: string[]
  keywords: string[]
  authors?: Author[]
  organization_name?: string
  region?: string
  data_time?: string
  doi?: string
  license?: string
  privacy_type?: string
  privacy_condition?: string
  storage_num?: number
  file_count?: number
  structured_count?: number
  visit_num: number
  download_num: number
  follow_num: number
  status?: string
  release_type?: string
  version?: string
  logo_url?: string
  file_formats?: FileFormat[]
  suffix_storage?: SuffixStorage[]
  corresponding_author_name?: string
  corresponding_author_email?: string
  unit_name?: string
  unit_address?: string
  unit_postal_code?: string
  approve_time?: string
  create_time?: string
}

export interface ResourcesResponse {
  data: Resource[]
  total: number
  limit: number
  offset: number
}

export interface StatsResponse {
  total: number
  open_count: number
  subject_count: number
  dataset_count: number
  paper_count: number
  software_count: number
}

export interface FacetItem {
  name: string
  count: number
}
