-- ============================================================
-- Alumni Network System — Complete PostgreSQL Schema
-- ============================================================

-- Custom ENUM types
CREATE TYPE user_role AS ENUM ('student', 'alumni', 'admin');
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'rejected', 'removed');
CREATE TYPE mentorship_status AS ENUM ('pending', 'accepted', 'rejected', 'ended');
CREATE TYPE post_type AS ENUM ('general', 'career', 'advice', 'opportunity');
CREATE TYPE job_type AS ENUM ('Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract', 'Temporary');
CREATE TYPE experience_level AS ENUM ('Entry Level', 'Mid Level', 'Senior Level', 'Lead / Principal', 'Director', 'VP / Executive', 'Fresher');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE referral_request_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE event_type AS ENUM ('Alumni Meet', 'Workshop', 'Webinar', 'Career Session', 'Networking Event', 'Hackathon', 'Seminar', 'Panel Discussion', 'Mentorship Program', 'Reunion', 'Other');
CREATE TYPE event_registration_status AS ENUM ('registered', 'cancelled');
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    full_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);

-- ============================================================
-- STUDENT PROFILES
-- ============================================================
CREATE TABLE student_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    college TEXT NOT NULL DEFAULT '',
    degree TEXT NOT NULL DEFAULT '',
    department TEXT NOT NULL DEFAULT '',
    graduation_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now())::INTEGER,
    semester INTEGER NOT NULL DEFAULT 1,
    location TEXT NOT NULL DEFAULT '',
    about TEXT NOT NULL DEFAULT '',
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    github TEXT,
    linkedin TEXT,
    portfolio TEXT,
    resume_url TEXT,
    career_interests JSONB NOT NULL DEFAULT '[]'::jsonb,
    preferred_roles JSONB NOT NULL DEFAULT '[]'::jsonb,
    preferred_locations JSONB NOT NULL DEFAULT '[]'::jsonb,
    projects JSONB NOT NULL DEFAULT '[]'::jsonb,
    certifications JSONB NOT NULL DEFAULT '[]'::jsonb,
    achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
    profile_completion INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_student_profiles_department ON student_profiles (department);
CREATE INDEX idx_student_profiles_graduation_year ON student_profiles (graduation_year);
CREATE INDEX idx_student_profiles_skills ON student_profiles USING gin (skills);

-- ============================================================
-- ALUMNI PROFILES
-- ============================================================
CREATE TABLE alumni_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    graduation_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now())::INTEGER,
    degree TEXT NOT NULL DEFAULT '',
    department TEXT NOT NULL DEFAULT '',
    current_company TEXT NOT NULL DEFAULT '',
    current_designation TEXT NOT NULL DEFAULT '',
    years_of_experience INTEGER NOT NULL DEFAULT 0,
    previous_companies JSONB NOT NULL DEFAULT '[]'::jsonb,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    education JSONB NOT NULL DEFAULT '[]'::jsonb,
    achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
    career_journey TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    linkedin TEXT,
    github TEXT,
    portfolio TEXT,
    about TEXT NOT NULL DEFAULT '',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_mentor BOOLEAN NOT NULL DEFAULT false,
    badges JSONB NOT NULL DEFAULT '[]'::jsonb,
    mentorship_available BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_alumni_profiles_department ON alumni_profiles (department);
CREATE INDEX idx_alumni_profiles_is_verified ON alumni_profiles (is_verified);
CREATE INDEX idx_alumni_profiles_is_mentor ON alumni_profiles (is_mentor);
CREATE INDEX idx_alumni_profiles_skills ON alumni_profiles USING gin (skills);

-- ============================================================
-- CONNECTIONS
-- ============================================================
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status connection_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (sender_id, receiver_id)
);

CREATE INDEX idx_connections_sender ON connections (sender_id);
CREATE INDEX idx_connections_receiver ON connections (receiver_id);
CREATE INDEX idx_connections_status ON connections (status);

-- ============================================================
-- MENTORSHIP REQUESTS
-- ============================================================
CREATE TABLE mentorship_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alumni_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    career_goal TEXT NOT NULL DEFAULT '',
    reason TEXT NOT NULL DEFAULT '',
    preferred_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    message TEXT NOT NULL DEFAULT '',
    status mentorship_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mentorship_requests_student ON mentorship_requests (student_id);
CREATE INDEX idx_mentorship_requests_alumni ON mentorship_requests (alumni_id);
CREATE INDEX idx_mentorship_requests_status ON mentorship_requests (status);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CONVERSATION PARTICIPANTS
-- ============================================================
CREATE TABLE conversation_participants (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_user ON conversation_participants (user_id);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages (conversation_id);
CREATE INDEX idx_messages_sender ON messages (sender_id);
CREATE INDEX idx_messages_created_at ON messages (created_at DESC);

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type post_type NOT NULL DEFAULT 'general',
    media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_author ON posts (author_id);
CREATE INDEX idx_posts_type ON posts (type);
CREATE INDEX idx_posts_created_at ON posts (created_at DESC);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_post ON comments (post_id);
CREATE INDEX idx_comments_author ON comments (author_id);

-- ============================================================
-- LIKES
-- ============================================================
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (post_id, user_id)
);

CREATE INDEX idx_likes_post ON likes (post_id);
CREATE INDEX idx_likes_user ON likes (user_id);

-- ============================================================
-- JOBS
-- ============================================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT NOT NULL,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    location TEXT NOT NULL DEFAULT '',
    salary TEXT,
    job_type job_type NOT NULL DEFAULT 'Full-time',
    experience_level experience_level NOT NULL DEFAULT 'Entry Level',
    deadline DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_jobs_posted_by ON jobs (posted_by);
CREATE INDEX idx_jobs_job_type ON jobs (job_type);
CREATE INDEX idx_jobs_experience_level ON jobs (experience_level);
CREATE INDEX idx_jobs_is_active ON jobs (is_active);
CREATE INDEX idx_jobs_skills ON jobs USING gin (skills);
CREATE INDEX idx_jobs_created_at ON jobs (created_at DESC);

-- ============================================================
-- JOB APPLICATIONS
-- ============================================================
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_url TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    status application_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (job_id, student_id)
);

CREATE INDEX idx_job_applications_job ON job_applications (job_id);
CREATE INDEX idx_job_applications_student ON job_applications (student_id);
CREATE INDEX idx_job_applications_status ON job_applications (status);

-- ============================================================
-- REFERRALS
-- ============================================================
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alumni_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_referrals_alumni ON referrals (alumni_id);
CREATE INDEX idx_referrals_is_active ON referrals (is_active);

-- ============================================================
-- REFERRAL REQUESTS
-- ============================================================
CREATE TABLE referral_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_url TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    why_suitable TEXT NOT NULL DEFAULT '',
    status referral_request_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (referral_id, student_id)
);

CREATE INDEX idx_referral_requests_referral ON referral_requests (referral_id);
CREATE INDEX idx_referral_requests_student ON referral_requests (student_id);
CREATE INDEX idx_referral_requests_status ON referral_requests (status);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    venue TEXT NOT NULL DEFAULT '',
    speaker TEXT,
    registration_deadline DATE NOT NULL,
    max_participants INTEGER,
    event_type event_type NOT NULL DEFAULT 'Other',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_event_date ON events (event_date);
CREATE INDEX idx_events_event_type ON events (event_type);
CREATE INDEX idx_events_created_by ON events (created_by);
CREATE INDEX idx_events_registration_deadline ON events (registration_deadline);

-- ============================================================
-- EVENT REGISTRATIONS
-- ============================================================
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status event_registration_status NOT NULL DEFAULT 'registered',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (event_id, user_id)
);

CREATE INDEX idx_event_registrations_event ON event_registrations (event_id);
CREATE INDEX idx_event_registrations_user ON event_registrations (user_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_read ON notifications (read);
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL,
    content_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status report_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_reported_by ON reports (reported_by);
CREATE INDEX idx_reports_status ON reports (status);
CREATE INDEX idx_reports_content ON reports (content_type, content_id);

-- ============================================================
-- AI ANALYSIS
-- ============================================================
CREATE TABLE ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL,
    result JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_analysis_user ON ai_analysis (user_id);
CREATE INDEX idx_ai_analysis_type ON ai_analysis (analysis_type);

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_student_profiles_updated_at
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_alumni_profiles_updated_at
    BEFORE UPDATE ON alumni_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_mentorship_requests_updated_at
    BEFORE UPDATE ON mentorship_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-create public.users when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
    COALESCE(
      TRIM(COALESCE(NEW.raw_user_meta_data->>'first_name','') || ' ' || COALESCE(NEW.raw_user_meta_data->>'last_name','')),
      COALESCE(NEW.raw_user_meta_data->>'full_name','')
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "Users can view all profiles"
    ON users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
    ON users FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- STUDENT PROFILES
CREATE POLICY "Anyone authenticated can view student profiles"
    ON student_profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Students can update own profile"
    ON student_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own profile"
    ON student_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all student profiles"
    ON student_profiles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ALUMNI PROFILES
CREATE POLICY "Anyone authenticated can view alumni profiles"
    ON alumni_profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Alumni can update own profile"
    ON alumni_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Alumni can insert own profile"
    ON alumni_profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all alumni profiles"
    ON alumni_profiles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- CONNECTIONS
CREATE POLICY "Users can view own connections"
    ON connections FOR SELECT
    TO authenticated
    USING (
        auth.uid() = sender_id
        OR auth.uid() = receiver_id
    );

CREATE POLICY "Users can create connection requests"
    ON connections FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own connection requests"
    ON connections FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = sender_id
        OR auth.uid() = receiver_id
    );

CREATE POLICY "Users can remove own connections"
    ON connections FOR DELETE
    TO authenticated
    USING (
        auth.uid() = sender_id
        OR auth.uid() = receiver_id
    );

-- MENTORSHIP REQUESTS
CREATE POLICY "Users can view own mentorship requests"
    ON mentorship_requests FOR SELECT
    TO authenticated
    USING (
        auth.uid() = student_id
        OR auth.uid() = alumni_id
    );

CREATE POLICY "Students can create mentorship requests"
    ON mentorship_requests FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Alumni can update mentorship requests"
    ON mentorship_requests FOR UPDATE
    TO authenticated
    USING (auth.uid() = alumni_id);

-- CONVERSATIONS
CREATE POLICY "Users can view own conversations"
    ON conversations FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = conversations.id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create conversations"
    ON conversations FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- CONVERSATION PARTICIPANTS
CREATE POLICY "Users can view participants in own conversations"
    ON conversation_participants FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = conversation_participants.conversation_id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can add participants"
    ON conversation_participants FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- MESSAGES
CREATE POLICY "Users can view messages in own conversations"
    ON messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages in own conversations"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM conversation_participants
            WHERE conversation_id = messages.conversation_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own messages"
    ON messages FOR UPDATE
    TO authenticated
    USING (auth.uid() = sender_id);

-- POSTS
CREATE POLICY "Anyone authenticated can view posts"
    ON posts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create posts"
    ON posts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
    ON posts FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
    ON posts FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all posts"
    ON posts FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- COMMENTS
CREATE POLICY "Anyone authenticated can view comments"
    ON comments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create comments"
    ON comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own comments"
    ON comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments"
    ON comments FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

-- LIKES
CREATE POLICY "Anyone authenticated can view likes"
    ON likes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create likes"
    ON likes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
    ON likes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- JOBS
CREATE POLICY "Anyone authenticated can view active jobs"
    ON jobs FOR SELECT
    TO authenticated
    USING (is_active = true OR auth.uid() = posted_by);

CREATE POLICY "Alumni and admins can create jobs"
    ON jobs FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = posted_by
        AND EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('alumni', 'admin')
        )
    );

CREATE POLICY "Job posters can update own jobs"
    ON jobs FOR UPDATE
    TO authenticated
    USING (auth.uid() = posted_by);

CREATE POLICY "Job posters can delete own jobs"
    ON jobs FOR DELETE
    TO authenticated
    USING (auth.uid() = posted_by);

-- JOB APPLICATIONS
CREATE POLICY "Students can view own applications"
    ON job_applications FOR SELECT
    TO authenticated
    USING (
        auth.uid() = student_id
        OR EXISTS (
            SELECT 1 FROM jobs WHERE id = job_id AND posted_by = auth.uid()
        )
    );

CREATE POLICY "Students can create applications"
    ON job_applications FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Job posters can update application status"
    ON job_applications FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM jobs WHERE id = job_id AND posted_by = auth.uid()
        )
    );

-- REFERRALS
CREATE POLICY "Anyone authenticated can view active referrals"
    ON referrals FOR SELECT
    TO authenticated
    USING (is_active = true OR auth.uid() = alumni_id);

CREATE POLICY "Alumni can create referrals"
    ON referrals FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = alumni_id
        AND EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'alumni'
        )
    );

CREATE POLICY "Alumni can update own referrals"
    ON referrals FOR UPDATE
    TO authenticated
    USING (auth.uid() = alumni_id);

-- REFERRAL REQUESTS
CREATE POLICY "Users can view relevant referral requests"
    ON referral_requests FOR SELECT
    TO authenticated
    USING (
        auth.uid() = student_id
        OR EXISTS (
            SELECT 1 FROM referrals WHERE id = referral_id AND alumni_id = auth.uid()
        )
    );

CREATE POLICY "Students can create referral requests"
    ON referral_requests FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Alumni can update referral request status"
    ON referral_requests FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM referrals WHERE id = referral_id AND alumni_id = auth.uid()
        )
    );

-- EVENTS
CREATE POLICY "Anyone authenticated can view events"
    ON events FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Alumni and admins can create events"
    ON events FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = created_by
        AND EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('alumni', 'admin')
        )
    );

CREATE POLICY "Event creators can update own events"
    ON events FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);

CREATE POLICY "Event creators can delete own events"
    ON events FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);

-- EVENT REGISTRATIONS
CREATE POLICY "Users can view own registrations"
    ON event_registrations FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM events WHERE id = event_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can register for events"
    ON event_registrations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own registrations"
    ON event_registrations FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- REPORTS
CREATE POLICY "Users can create reports"
    ON reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can view own reports"
    ON reports FOR SELECT
    TO authenticated
    USING (
        auth.uid() = reported_by
        OR EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all reports"
    ON reports FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- AI ANALYSIS
CREATE POLICY "Users can view own AI analysis"
    ON ai_analysis FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI analysis"
    ON ai_analysis FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all AI analysis"
    ON ai_analysis FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
