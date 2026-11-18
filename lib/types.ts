export const CATEGORIES = ["Android Apps", "AI Tools", "Web Apps", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Project {
  id: string;
  title: string;
  category: Category | null;
  description: string | null;
  tech_stack: string[] | null;
  image_url: string | null;
  download_url: string | null;
  website_url: string | null;
  is_featured: boolean;
  created_at: string;
}
