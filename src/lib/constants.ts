export const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Business Administration',
  'MBA',
  'Data Science',
  'Artificial Intelligence',
  'Other',
] as const;

export const SKILLS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C++',
  'React',
  'Next.js',
  'Node.js',
  'Express.js',
  'Django',
  'Flask',
  'Spring Boot',
  'HTML/CSS',
  'Tailwind CSS',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'Redis',
  'AWS',
  'Azure',
  'GCP',
  'Docker',
  'Kubernetes',
  'Git',
  'CI/CD',
  'Machine Learning',
  'Deep Learning',
  'Data Analysis',
  'TensorFlow',
  'PyTorch',
  'Figma',
  'UI/UX Design',
  'Project Management',
  'Agile',
  'Scrum',
  'Communication',
  'Leadership',
  'Problem Solving',
  'Team Management',
  'Other',
] as const;

export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'E-commerce',
  'Manufacturing',
  'Consulting',
  'Media & Entertainment',
  'Real Estate',
  'Automotive',
  'Energy',
  'Telecommunications',
  'Government',
  'Non-Profit',
  'Other',
] as const;

export const JOB_TYPES = [
  'full-time',
  'part-time',
  'internship',
  'contract',
] as const;

export const EVENT_TYPES = [
  'workshop',
  'seminar',
  'networking',
  'webinar',
  'other',
] as const;

export const POST_TYPES = [
  'general',
  'job',
  'event',
  'achievement',
  'question',
] as const;

export const SKILL_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
] as const;

export const GRADUATION_YEARS = Array.from(
  { length: 20 },
  (_, i) => new Date().getFullYear() - i
);

export const INDIAN_CITIES = [
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Remote',
  'Other',
] as const;

export const MENTORSHIP_TOPICS = [
  'Career Guidance',
  'Technical Skills',
  'Interview Preparation',
  'Resume Review',
  'Networking',
  'Leadership',
  'Entrepreneurship',
  'Work-Life Balance',
  'Higher Studies',
  'Certification Guidance',
  'Project Guidance',
  'Other',
] as const;

export const TIME_BASED_GREETING = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const PROFILE_FIELDS = {
  basic: [
    'first_name',
    'last_name',
    'avatar_url',
    'phone',
    'bio',
    'location',
  ],
  education: ['department', 'graduation_year'],
  social: ['linkedin_url', 'github_url', 'portfolio_url'],
  career: ['skills', 'interests', 'preferred_roles', 'preferred_locations'],
} as const;

export const COLLEGE_NAME = "National Institute of Technology";
export const COLLEGE_SHORT_NAME = "NIT Alumni Network";

export const DEGREES = ["B.Tech", "M.Tech", "B.Sc", "M.Sc", "BCA", "MCA", "MBA", "Ph.D"] as const;

export const SKILLS_LIST = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "React", "Next.js", "Node.js",
  "SQL", "MongoDB", "AWS", "Docker", "Kubernetes", "Machine Learning", "Data Science",
  "UI/UX Design", "Project Management", "Leadership", "Communication", "Problem Solving",
] as const;

import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Briefcase,
  BookOpen,
  Calendar,
  Settings,
  User,
  BarChart3,
  GraduationCap,
  Search,
  Bell,
  FileText,
  Target,
} from "lucide-react";

export const NAVIGATION_ITEMS: Record<string, { label: string; href: string; icon: any }[]> = {
  student: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Alumni Directory", href: "/dashboard/alumni", icon: Users },
    { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { label: "Job Board", href: "/dashboard/jobs", icon: Briefcase },
    { label: "Events", href: "/dashboard/events", icon: Calendar },
    { label: "Resources", href: "/dashboard/resources", icon: BookOpen },
    { label: "Profile", href: "/dashboard/profile", icon: User },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  alumni: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Mentorship", href: "/dashboard/mentorship", icon: Target },
    { label: "Job Board", href: "/dashboard/jobs", icon: Briefcase },
    { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { label: "Events", href: "/dashboard/events", icon: Calendar },
    { label: "Resources", href: "/dashboard/resources", icon: BookOpen },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Profile", href: "/dashboard/profile", icon: User },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/dashboard/users", icon: Users },
    { label: "Alumni Directory", href: "/dashboard/alumni", icon: GraduationCap },
    { label: "Job Board", href: "/dashboard/jobs", icon: Briefcase },
    { label: "Events", href: "/dashboard/events", icon: Calendar },
    { label: "Posts", href: "/dashboard/posts", icon: FileText },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
};
