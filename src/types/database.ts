export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      student_profiles: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          avatar_url: string | null;
          college: string;
          department: string;
          degree: string;
          graduation_year: number;
          enrollment_number: string;
          skills: string[];
          about: string | null;
          location: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name: string;
          last_name: string;
          avatar_url?: string | null;
          college: string;
          department: string;
          degree: string;
          graduation_year: number;
          enrollment_number: string;
          skills?: string[];
          about?: string | null;
          location?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          avatar_url?: string | null;
          college?: string;
          department?: string;
          degree?: string;
          graduation_year?: number;
          enrollment_number?: string;
          skills?: string[];
          about?: string | null;
          location?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      alumni_profiles: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          avatar_url: string | null;
          college: string;
          department: string;
          degree: string;
          graduation_year: number;
          current_company: string | null;
          current_position: string | null;
          current_role: string | null;
          industry: string | null;
          skills: string[];
          about: string | null;
          bio: string | null;
          phone: string | null;
          location: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          portfolio_url: string | null;
          is_verified: boolean;
          is_mentor: boolean;
          available_for_mentorship: boolean;
          mentorship_availability: string;
          mentorship_topics: string[];
          achievements: unknown[];
          years_of_experience: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name: string;
          last_name: string;
          avatar_url?: string | null;
          college: string;
          department: string;
          degree: string;
          graduation_year: number;
          current_company?: string | null;
          current_position?: string | null;
          current_role?: string | null;
          industry?: string | null;
          skills?: string[];
          about?: string | null;
          bio?: string | null;
          phone?: string | null;
          location?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          is_verified?: boolean;
          is_mentor?: boolean;
          available_for_mentorship?: boolean;
          mentorship_availability?: string;
          mentorship_topics?: string[];
          achievements?: unknown[];
          years_of_experience?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          avatar_url?: string | null;
          college?: string;
          department?: string;
          degree?: string;
          graduation_year?: number;
          current_company?: string | null;
          current_position?: string | null;
          current_role?: string | null;
          industry?: string | null;
          skills?: string[];
          about?: string | null;
          bio?: string | null;
          phone?: string | null;
          location?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          is_verified?: boolean;
          is_mentor?: boolean;
          available_for_mentorship?: boolean;
          mentorship_availability?: string;
          mentorship_topics?: string[];
          achievements?: unknown[];
          years_of_experience?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
