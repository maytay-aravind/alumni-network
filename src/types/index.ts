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
          industry: string | null;
          skills: string[];
          about: string | null;
          location: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          is_mentor: boolean;
          available_for_mentorship: boolean;
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
          industry?: string | null;
          skills?: string[];
          about?: string | null;
          location?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          is_mentor?: boolean;
          available_for_mentorship?: boolean;
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
          industry?: string | null;
          skills?: string[];
          about?: string | null;
          location?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          is_mentor?: boolean;
          available_for_mentorship?: boolean;
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

export type UserRole = 'student' | 'alumni' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface StudentProfile {
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
}

export interface AlumniProfile {
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
  industry: string | null;
  skills: string[];
  about: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  phone: string | null;
  bio: string | null;
  current_role: string | null;
  years_of_experience: number | null;
  portfolio_url: string | null;
  mentorship_availability: string | null;
  mentorship_topics: string[];
  achievements: { id: string; type: string; title: string; description: string; year: number }[];
  career_journey: { id: string; company: string; position: string; start_date: string; end_date: string; description: string }[];
  is_verified: boolean;
  is_mentor: boolean;
  available_for_mentorship: boolean;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  requester?: StudentProfile | AlumniProfile;
  receiver?: StudentProfile | AlumniProfile;
}

export interface MentorshipRequest {
  id: string;
  student_id: string;
  alumni_id: string;
  career_goal: string;
  reason: string;
  topics: string[];
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
  student?: StudentProfile;
  alumni?: AlumniProfile;
}

export interface Job {
  id: string;
  posted_by: string;
  title: string;
  company: string;
  location: string;
  job_type: 'full-time' | 'part-time' | 'internship' | 'contract';
  description: string;
  requirements: string[];
  skills_required: string[];
  salary_range: string | null;
  application_deadline: string;
  application_url: string | null;
  is_active: boolean;
  created_at: string;
  applications_count: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: 'workshop' | 'seminar' | 'networking' | 'webinar' | 'other';
  date: string;
  end_date: string | null;
  venue: string | null;
  meeting_url: string | null;
  speaker: string | null;
  max_participants: number | null;
  registration_count: number;
  created_by: string;
  created_at: string;
  is_registered?: boolean;
}

export interface Post {
  id: string;
  author_id: string;
  author_role: UserRole;
  content: string;
  post_type: 'general' | 'job' | 'event' | 'achievement' | 'question';
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  author?: StudentProfile | AlumniProfile;
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message: string;
  last_message_at: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'connection' | 'mentorship' | 'job' | 'event' | 'post' | 'message';
  is_read: boolean;
  link: string | null;
  created_at: string;
}
