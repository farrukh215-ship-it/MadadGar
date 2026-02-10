export type PostType = 'recommendation' | 'self';

export type MessageType = 'text' | 'image' | 'location';

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  sort_order: number;
}

export interface User {
  id: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  area: string | null;
  city: string | null;
  is_worker: boolean;
  worker_skill: string | null;
  worker_intro: string | null;
  worker_rate: string | null;
  availability: boolean;
  gallery_urls: string[];
  trust_score: number;
  recommendations_count: number;
  phone_masked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_id: string;
  category_id: string;
  phone_entity_id: string | null;
  post_type: PostType;
  worker_name: string | null;
  phone: string;
  location: unknown;
  area_text: string | null;
  reason: string | null;
  relation_tag: string | null;
  intro: string | null;
  images: string[];
  availability: boolean;
  optional_rate: string | null;
  shadow_hidden: boolean;
  madad_count: number;
  created_at: string;
  updated_at: string;
}

export interface FeedItem extends Post {
  category_name: string;
  distance_m?: number;
  avg_rating?: number;
  rec_count?: number;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string | null;
  message_type: MessageType;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ChatThread {
  id: string;
  post_id: string | null;
  created_at: string;
  updated_at: string;
}
