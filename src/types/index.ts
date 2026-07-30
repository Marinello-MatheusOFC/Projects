export type Role = 'admin' | 'superadmin';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type AnimalSpecies = 'dog' | 'cat' | 'other';
export type AnimalSex = 'male' | 'female';
export type AnimalSize = 'small' | 'medium' | 'large';
export type AnimalStatus = 'available' | 'adopted' | 'in_process' | 'archived';

export interface Animal {
  id: string;
  name: string;
  slug: string;
  species: AnimalSpecies;
  sex: AnimalSex;
  size: AnimalSize;
  birth_date_estimate: string | null;
  age_text: string | null;
  description: string | null;
  history: string | null;
  health_notes: string | null;
  personality: string | null;
  compatibility_notes: string | null;
  vaccinated: boolean;
  neutered: boolean;
  special_needs: boolean;
  status: AnimalStatus;
  featured: boolean;
  published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AnimalImage {
  id: string;
  animal_id: string;
  storage_path: string;
  alt_text: string | null;
  position: number;
  is_cover: boolean;
  created_at: string;
}

export type AdoptionStatus =
  | 'new'
  | 'under_review'
  | 'contacted'
  | 'interview'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export interface AdoptionApplication {
  id: string;
  animal_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  city: string;
  housing_type: string;
  has_protective_screens: boolean;
  has_other_animals: boolean;
  household_agreement: boolean;
  reason: string;
  availability: string;
  privacy_consent: boolean;
  status: AdoptionStatus;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdoptionStatusHistory {
  id: string;
  application_id: string;
  previous_status: AdoptionStatus | null;
  new_status: AdoptionStatus;
  note: string | null;
  changed_by: string;
  created_at: string;
}

export type EventStatus = 'scheduled' | 'cancelled' | 'completed';

export interface Event {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  start_at: string;
  end_at: string | null;
  location_name: string | null;
  address: string | null;
  external_url: string | null;
  image_path: string | null;
  status: EventStatus;
  published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type NewsStatus = 'draft' | 'published';

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_path: string | null;
  status: NewsStatus;
  published_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  category_id: string | null;
  image_path: string | null;
  available: boolean;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type ContactMessageStatus = 'new' | 'read' | 'archived';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  privacy_consent: boolean;
  status: ContactMessageStatus;
  created_at: string;
  updated_at: string;
}

export type VolunteerStatus = 'new' | 'under_review' | 'contacted' | 'approved' | 'rejected' | 'archived';

export interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  availability: string;
  interests: string;
  experience: string | null;
  message: string | null;
  privacy_consent: boolean;
  status: VolunteerStatus;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_path: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  album_id: string;
  storage_path: string;
  alt_text: string | null;
  caption: string | null;
  position: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value_json: Record<string, unknown>;
  public: boolean;
  updated_by: string | null;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
