-- =====================================================
-- RSC CHAIN ADMIN PANEL - COMPLETE DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ADMINS & ROLES MODULE
-- =====================================================

-- Admin users table
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255),
    role_id UUID,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Roles table
CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key for role
ALTER TABLE admins ADD CONSTRAINT fk_admin_role 
    FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE SET NULL;

-- =====================================================
-- 2. AUDIT LOG MODULE
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_module ON audit_logs(module);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- =====================================================
-- 3. CONTENT MANAGEMENT MODULE
-- =====================================================

-- Site configuration
CREATE TABLE site_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB DEFAULT '{}',
    description TEXT,
    updated_by UUID REFERENCES admins(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Announcements/Banners
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    type VARCHAR(50) DEFAULT 'banner' CHECK (type IN ('banner', 'popup', 'highlight', 'notice')),
    priority INTEGER DEFAULT 0,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    target_pages JSONB DEFAULT '[]',
    style_config JSONB DEFAULT '{}',
    created_by UUID REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Dynamic pages
CREATE TABLE dynamic_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    is_published BOOLEAN DEFAULT false,
    template VARCHAR(50) DEFAULT 'default',
    created_by UUID REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. USERS MODULE (Enhanced)
-- =====================================================

-- User support tickets
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES admins(id),
    resolution TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- User actions log
CREATE TABLE user_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. METRICS MODULE
-- =====================================================

-- Generic metrics table
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_key VARCHAR(100) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    current_value NUMERIC DEFAULT 0,
    target_value NUMERIC,
    unit VARCHAR(50),
    category VARCHAR(50),
    source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'api', 'scraper', 'webhook', 'calculated')),
    metadata JSONB DEFAULT '{}',
    last_updated TIMESTAMP DEFAULT NOW(),
    updated_by UUID REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Metric history
CREATE TABLE metric_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_id UUID REFERENCES metrics(id) ON DELETE CASCADE,
    value NUMERIC NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    source VARCHAR(50),
    notes TEXT
);

-- Create index
CREATE INDEX idx_metrics_key ON metrics(metric_key);
CREATE INDEX idx_metric_history_metric ON metric_history(metric_id, timestamp DESC);

-- =====================================================
-- 6. CAMPAIGNS/EVENTS MODULE
-- =====================================================

-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'event' CHECK (type IN ('event', 'promotion', 'airdrop', 'milestone', 'contest')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    config JSONB DEFAULT '{}',
    created_by UUID REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaign milestones/goals
CREATE TABLE campaign_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    metric_id UUID REFERENCES metrics(id),
    target_value NUMERIC NOT NULL,
    current_progress NUMERIC DEFAULT 0,
    reward_config JSONB DEFAULT '{}',
    is_achieved BOOLEAN DEFAULT false,
    achieved_at TIMESTAMP,
    order_index INTEGER DEFAULT 0
);

-- Campaign tasks (for users)
CREATE TABLE campaign_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) NOT NULL,
    requirements JSONB DEFAULT '{}',
    reward_amount NUMERIC DEFAULT 0,
    reward_type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User task completion
CREATE TABLE user_task_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES campaign_tasks(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'approved', 'rejected', 'rewarded')),
    proof JSONB DEFAULT '{}',
    completed_at TIMESTAMP DEFAULT NOW(),
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES admins(id),
    UNIQUE(user_id, task_id)
);

-- =====================================================
-- 7. REWARDS ENGINE MODULE
-- =====================================================

-- Reward rules (generic)
CREATE TABLE reward_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('metric', 'date', 'manual', 'on_chain', 'in_app', 'task')),
    trigger_config JSONB DEFAULT '{}',
    eligibility_rules JSONB DEFAULT '{}',
    reward_config JSONB DEFAULT '{}',
    approval_required BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    max_recipients INTEGER,
    created_by UUID REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Reward batches
CREATE TABLE reward_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES reward_rules(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    batch_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    total_recipients INTEGER DEFAULT 0,
    processed_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    executed_by UUID REFERENCES admins(id),
    approved_by UUID REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT NOW(),
    executed_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Individual reward distributions
CREATE TABLE reward_distributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES reward_batches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL,
    amount NUMERIC NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    tx_hash VARCHAR(255),
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- =====================================================
-- 8. JOBS/AUTOMATION MODULE
-- =====================================================

-- Scheduled jobs
CREATE TABLE scheduled_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    job_type VARCHAR(50) NOT NULL,
    schedule_config JSONB DEFAULT '{}', -- cron expression, etc
    action_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    created_by UUID REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Job execution log
CREATE TABLE job_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES scheduled_jobs(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    duration_ms INTEGER,
    result JSONB DEFAULT '{}',
    error_message TEXT
);

-- =====================================================
-- 9. TREASURY/FINANCE MODULE
-- =====================================================

-- Treasury configuration
CREATE TABLE treasury_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_limit NUMERIC DEFAULT 0,
    weekly_limit NUMERIC DEFAULT 0,
    monthly_limit NUMERIC DEFAULT 0,
    approval_threshold NUMERIC DEFAULT 0,
    auto_approve_under NUMERIC DEFAULT 0,
    hot_wallet_address VARCHAR(255),
    cold_wallet_address VARCHAR(255),
    config JSONB DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transaction ledger
CREATE TABLE transaction_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type VARCHAR(50) NOT NULL,
    from_address VARCHAR(255),
    to_address VARCHAR(255),
    amount NUMERIC NOT NULL,
    currency VARCHAR(20) DEFAULT 'RSC',
    tx_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    batch_id UUID REFERENCES reward_batches(id),
    user_id UUID REFERENCES users(id),
    approved_by UUID REFERENCES admins(id),
    executed_by UUID REFERENCES admins(id),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    executed_at TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_reward_rules_active ON reward_rules(is_active);
CREATE INDEX idx_reward_distributions_user ON reward_distributions(user_id);
CREATE INDEX idx_reward_distributions_batch ON reward_distributions(batch_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_transaction_ledger_user ON transaction_ledger(user_id);
CREATE INDEX idx_transaction_ledger_status ON transaction_ledger(status);

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default super admin role
INSERT INTO admin_roles (name, description, permissions) VALUES
('Super Admin', 'Full access to all modules', '{"all": true}'),
('Content Manager', 'Manage content and announcements', '{"content": true, "announcements": true}'),
('User Support', 'Manage users and support tickets', '{"users": true, "support": true}'),
('Campaign Manager', 'Manage campaigns and rewards', '{"campaigns": true, "rewards": true}'),
('Finance Manager', 'Manage treasury and transactions', '{"treasury": true, "transactions": true}');

-- Insert default metrics
INSERT INTO metrics (metric_key, metric_name, category, unit) VALUES
('youtube_followers', 'YouTube Followers', 'social', 'followers'),
('x_followers', 'X (Twitter) Followers', 'social', 'followers'),
('telegram_members', 'Telegram Members', 'social', 'members'),
('portal_users', 'Portal Registered Users', 'platform', 'users'),
('daily_active_users', 'Daily Active Users', 'platform', 'users'),
('total_mining_power', 'Total Mining Power', 'mining', 'H/s'),
('total_staked', 'Total Staked RSC', 'staking', 'RSC');

-- Insert default treasury config
INSERT INTO treasury_config (daily_limit, weekly_limit, monthly_limit, approval_threshold, auto_approve_under) VALUES
(10000, 50000, 150000, 5000, 100);

-- Insert default site config
INSERT INTO site_config (key, value, description) VALUES
('maintenance_mode', '{"enabled": false, "message": ""}', 'Site maintenance mode'),
('welcome_bonus', '{"enabled": true, "amount": 100}', 'Welcome bonus configuration'),
('referral_rewards', '{"enabled": true, "percentage": 10}', 'Referral reward settings'),
('social_links', '{"youtube": "", "twitter": "", "telegram": ""}', 'Social media links');

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_roles_updated_at BEFORE UPDATE ON admin_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reward_rules_updated_at BEFORE UPDATE ON reward_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (Optional - uncomment if needed)
-- =====================================================

-- ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- etc...

-- =====================================================
-- VIEWS FOR DASHBOARDS
-- =====================================================

-- Dashboard metrics view
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT 
    m.metric_key,
    m.metric_name,
    m.current_value,
    m.target_value,
    m.unit,
    m.category,
    m.last_updated,
    CASE 
        WHEN m.target_value > 0 THEN ROUND((m.current_value / m.target_value * 100)::numeric, 2)
        ELSE 0
    END as progress_percentage
FROM metrics m
WHERE m.last_updated > NOW() - INTERVAL '30 days';

-- Active campaigns view
CREATE OR REPLACE VIEW active_campaigns_summary AS
SELECT 
    c.id,
    c.name,
    c.type,
    c.status,
    c.start_date,
    c.end_date,
    COUNT(DISTINCT cm.id) as total_milestones,
    COUNT(DISTINCT CASE WHEN cm.is_achieved THEN cm.id END) as achieved_milestones,
    COUNT(DISTINCT ct.id) as total_tasks,
    COUNT(DISTINCT utc.id) as total_completions
FROM campaigns c
LEFT JOIN campaign_milestones cm ON c.id = cm.campaign_id
LEFT JOIN campaign_tasks ct ON c.id = ct.campaign_id
LEFT JOIN user_task_completions utc ON c.id = utc.campaign_id
WHERE c.status IN ('active', 'scheduled')
GROUP BY c.id, c.name, c.type, c.status, c.start_date, c.end_date;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

COMMENT ON DATABASE CURRENT_DATABASE() IS 'RSC Chain Admin Panel - Complete Schema';


