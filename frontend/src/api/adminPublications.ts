import axios from 'axios'
import { ADMIN_KEY } from '../store/adminAuth'

const client = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: { 'X-Admin-Key': ADMIN_KEY, Authorization: `Bearer ${ADMIN_KEY}` },
})

export interface GeoReview {
  id: number
  mainTicketNo: string
  mainTicketId: number | null
  submitterId: string
  submitterName: string | null
  submitterEmail: string | null
  resourceId: string | null
  resourceName: string | null
  resourceMetadata: Record<string, unknown>
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'returned'
  reviewerId: string | null
  reviewerName: string | null
  reviewNote: string | null
  reviewedAt: string | null
  callbackSent: boolean
  callbackError: string | null
  receivedAt: string
  updatedAt: string
  mailContacts?: GeoMailContact[]
}

export interface GeoReviewListItem {
  id: number
  mainTicketNo: string
  submitterName: string | null
  resourceName: string | null
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'returned'
  reviewerName: string | null
  reviewNote: string | null
  reviewedAt: string | null
  receivedAt: string
  createdAt?: string
}

export interface GeoMailContact {
  id: number
  senderName: string
  recipientEmail: string
  subject: string
  body: string
  sentAt: string
}

export interface GeoStats {
  total: number
  pending: number
  reviewing: number
  approved: number
  rejected: number
  returned: number
}

export async function listReviews(params?: { status?: string; limit?: number; offset?: number }) {
  const res = await client.get<{ items: GeoReviewListItem[]; total: number }>('/api/admin/publications', { params })
  return res.data
}

export async function getReview(id: number) {
  const res = await client.get<GeoReview>(`/api/admin/publications/${id}`)
  return res.data
}

export async function startReview(id: number) {
  const res = await client.post<GeoReview>(`/api/admin/publications/${id}/start`)
  return res.data
}

export async function submitReview(id: number, body: { result: 'APPROVED' | 'REJECTED' | 'RETURNED_FOR_REVISION'; reviewOpinion?: string }) {
  const res = await client.post<GeoReview>(`/api/admin/publications/${id}/review`, body)
  return res.data
}

export async function sendMockEmail(id: number, body: { subject: string; content: string }) {
  const res = await client.post<{ ok: boolean; isMock: boolean; recipientEmail: string; subject: string; sentAt: string }>(
    `/api/admin/publications/${id}/mock-email`,
    body
  )
  return res.data
}

export async function getStats() {
  const res = await client.get<GeoStats>('/api/admin/publications/stats')
  return res.data
}
