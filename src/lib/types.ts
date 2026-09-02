export interface FileItem {
  id: string;
  name: string;
  mime_type: string | null;
  size_bytes: number;
  folder_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface FolderItem {
  id: string;
  name: string;
  parent_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface BreadcrumbEntry {
  id: string; // 'root' for top-level
  name: string;
}

export interface UserShare {
  id: string;
  role: 'viewer' | 'editor';
  created_at: string;
  grantee_user_id: string;
  users: { email: string; name: string } | null;
}

export interface LinkShare {
  id: string;
  token: string;
  role: string;
  expires_at: string | null;
  hasPassword: boolean;
  created_at: string;
}