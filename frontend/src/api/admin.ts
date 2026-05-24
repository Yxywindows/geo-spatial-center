import axios from 'axios'
import { ADMIN_KEY } from '../store/adminAuth'

const client = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: { 'X-Admin-Key': ADMIN_KEY, Authorization: `Bearer ${ADMIN_KEY}` },
})

export interface GeoRequest {
  id: number
  main_request_no: string
  user_name: string | null
  user_institution: string | null
  user_email: string | null
  user_phone: string | null
  resource_id: string
  resource_name: string | null
  purpose: string | null
  use_scenario: string | null
  resource_detail: string | null
  applicant_ip: string | null
  attachment_path: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewer_note: string | null
  reviewed_at: string | null
  download_token: string | null
  download_url: string | null
  token_expires_at: string | null
  download_count: number
  max_downloads: number
  allowed_ips: string[] | null
  callback_sent: boolean
  received_at: string
  updated_at: string
}

export interface GeoRequestListItem {
  id: number
  main_request_no: string
  user_name: string | null
  user_institution: string | null
  resource_name: string | null
  purpose: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewer_note: string | null
  reviewed_at: string | null
  received_at: string
  callback_sent: boolean
  download_url: string | null
}

export async function listAdminRequests(params?: {
  status?: string
  sort?: 'asc' | 'desc'
  limit?: number
  offset?: number
}) {
  const res = await client.get<{ data: GeoRequestListItem[]; total: number }>('/api/admin/requests', { params })
  return res.data
}

export async function getAdminRequest(id: number) {
  const res = await client.get<GeoRequest>(`/api/admin/requests/${id}`)
  return res.data
}

export async function approveAdminRequest(id: number, reviewerNote: string) {
  const res = await client.post<{ ok: boolean; data: GeoRequest }>(`/api/admin/requests/${id}/approve`, { reviewerNote })
  return res.data
}

export async function rejectAdminRequest(id: number, reviewerNote: string) {
  const res = await client.post<{ ok: boolean; data: GeoRequest }>(`/api/admin/requests/${id}/reject`, { reviewerNote })
  return res.data
}
