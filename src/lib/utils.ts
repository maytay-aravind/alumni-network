import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const TIME_BASED_GREETING = (() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
})();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return format(d, 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export function getProfileCompletionPercentage(profile: Record<string, unknown>): number {
  const requiredFields = [
    'first_name',
    'last_name',
    'avatar_url',
    'about',
    'department',
    'graduation_year',
    'location',
    'skills',
    'linkedin_url',
  ];

  const completedFields = requiredFields.filter((field) => {
    const value = profile[field];
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== '';
  });

  return Math.round((completedFields.length / requiredFields.length) * 100);
}

export function getCareerReadinessScore(profile: {
  skills?: string[];
  projects?: unknown[];
  certifications?: unknown[];
  resume_url?: string;
  experience?: unknown[];
}): {
  overall: number;
  skills: number;
  projects: number;
  resume: number;
  certifications: number;
  experience: number;
} {
  const skills = Math.min(((profile.skills?.length || 0) / 8) * 100, 100);
  const projects = Math.min(((profile.projects?.length || 0) / 3) * 100, 100);
  const resume = profile.resume_url ? 100 : 0;
  const certifications = Math.min(((profile.certifications?.length || 0) / 3) * 100, 100);
  const experience = Math.min(((profile.experience?.length || 0) / 2) * 100, 100);

  const overall = Math.round(
    skills * 0.25 + projects * 0.25 + resume * 0.2 + certifications * 0.15 + experience * 0.15
  );

  return { overall, skills, projects, resume, certifications, experience };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getJobTypeBadgeVariant(type: string): 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' {
  switch (type) {
    case 'full-time':
      return 'success';
    case 'part-time':
      return 'secondary';
    case 'internship':
      return 'warning';
    case 'contract':
      return 'outline';
    default:
      return 'default';
  }
}

export function getEventTypeBadgeVariant(type: string): 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' {
  switch (type) {
    case 'workshop':
      return 'default';
    case 'seminar':
      return 'secondary';
    case 'networking':
      return 'success';
    case 'webinar':
      return 'warning';
    default:
      return 'outline';
  }
}

export function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'accepted':
    case 'connected':
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}
