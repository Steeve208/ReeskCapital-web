# 🚀 RSC Mining System - New Secure Architecture

## 📋 Overview

This is the **NEW SECURE ARCHITECTURE** for the RSC Mining System that implements:

- ✅ **Edge Functions** for secure token calculations (NO client-side token math)
- ✅ **Row Level Security (RLS)** for data isolation
- ✅ **Magic Link Authentication** (no passwords)
- ✅ **Heartbeat System** every 15 seconds
- ✅ **Session Management** with automatic timeout
- ✅ **Anti-abuse measures** (1 session per user, device fingerprinting)

## 🏗️ Architecture Overview

```
Frontend (Browser)
    ↓ (only UI, no token calculations)
Edge Functions (Supabase)
    ↓ (secure token calculations)
PostgreSQL Database (with RLS)
```

### Key Security Features

1. **NO TOKEN CALCULATIONS IN FRONTEND** - All math happens in Edge Functions
2. **Service Role Only** - Edge Functions use service_role key, never exposed to client
3. **RLS Enabled** - Users can only see their own data
4. **Session Validation** - Every request validates user ownership
5. **Rate Limiting** - Heartbeat every 15s, timeout after 60s inactivity

## 🛠️ Setup Instructions

### 1. Database Setup

Execute this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of: supabase-architecture-setup.sql
```

This creates:
- `profiles` table (extends auth.users)
- `mining_sessions` table (active mining sessions)
- `balances` table (RSC token balances)
- `mining_events` table (audit trail)
- RLS policies and triggers

### 2. Edge Functions Deployment

#### Deploy start_mining:

1. Go to Supabase Dashboard → Edge Functions
2. Create new function named `start_mining`
3. Copy content from `supabase/functions/start_mining/index.ts`
4. Set environment variables (see below)
5. Deploy

#### Deploy heartbeat:

1. Create new function named `heartbeat`
2. Copy content from `supabase/functions/heartbeat/index.ts`
3. Set environment variables
4. Deploy

#### Deploy stop_mining:

1. Create new function named `stop_mining`
2. Copy content from `supabase/functions/stop_mining/index.ts`
3. Set environment variables
4. Deploy

### 3. Environment Variables

Set these in each Edge Function:

```bash
SUPABASE_URL=https://unevdceponbnmhvpzlzf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
HEARTBEAT_INTERVAL_SEC=15
SESSION_TIMEOUT_SEC=60
RATE_RSC_PER_SEC=0.002
MAX_CONCURRENT_SESSIONS=1
```

**⚠️ IMPORTANT**: Get your service_role key from Supabase Dashboard → Settings → API

### 4. Frontend Files

Copy these files to your web server:

- `scripts/supabaseClient-new.js` - New Supabase client
- `scripts/mining-system-new-architecture.js` - Mining system logic
- `rsc-mining-secure.html` - Secure mining page

## 🚀 Usage

### 1. User Flow

1. **User visits page** → Sees login form
2. **Enters email** → Receives magic link
3. **Clicks magic link** → Automatically signed in
4. **Clicks "Start Mining"** → Creates mining session
5. **Heartbeats every 15s** → Server calculates and adds tokens
6. **Clicks "Stop Mining"** → Ends session
7. **Or closes tab** → Session times out after 60s

### 2. API Endpoints

The system uses these Edge Functions:

- `POST /functions/v1/start_mining` - Start mining session
- `POST /functions/v1/heartbeat` - Send heartbeat (every 15s)
- `POST /functions/v1/stop_mining` - Stop mining session

### 3. Database Tables

#### profiles
- Extends Supabase auth.users
- Stores display name and role
- Auto-created on signup

#### mining_sessions
- Active mining sessions
- Tracks time, tokens earned, device info
- Status: active/ended/timeout

#### balances
- RSC token balances per user
- Auto-created on signup
- Updated only by Edge Functions

#### mining_events
- Audit trail of all mining actions
- Used for heartbeat timing calculations

## 🔒 Security Features

### 1. Row Level Security (RLS)

```sql
-- Users can only see their own data
create policy "profiles_self" on public.profiles
  for select using (auth.uid() = id);

create policy "sessions_own" on public.mining_sessions
  for select using (auth.uid() = user_id);
```

### 2. Edge Function Security

- **Service Role Only**: Functions use service_role key (never exposed)
- **JWT Validation**: Every request validates user token
- **Ownership Check**: Users can only modify their own sessions
- **Input Validation**: All inputs are sanitized

### 3. Anti-Abuse Measures

- **1 Session Per User**: MAX_CONCURRENT_SESSIONS=1
- **Heartbeat Required**: Sessions timeout after 60s inactivity
- **Device Fingerprinting**: Tracks device characteristics
- **IP Logging**: Records user IP addresses

## 🧪 Testing

### 1. Manual Testing

1. **Deploy Edge Functions** with correct environment variables
2. **Open rsc-mining-secure.html** in browser
3. **Enter email** and check for magic link
4. **Click magic link** to sign in
5. **Start mining** and observe heartbeats
6. **Check database** for session creation

### 2. cURL Testing

```bash
# Get token from browser console after login
export TOKEN="eyJhbGciOi..."

# Start mining
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"device_fingerprint":"test-123"}' \
  https://unevdceponbnmhvpzlzf.supabase.co/functions/v1/start_mining

# Send heartbeat
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"<UUID>"}' \
  https://unevdceponbnmhvpzlzf.supabase.co/functions/v1/heartbeat
```

### 3. Database Verification

```sql
-- Check active sessions
SELECT * FROM mining_sessions WHERE status = 'active';

-- Check user balances
SELECT * FROM balances;

-- Check mining events
SELECT * FROM mining_events ORDER BY ts DESC LIMIT 10;
```

## 📊 Monitoring

### 1. Admin Dashboard

Use the `admin_sessions` view:

```sql
SELECT * FROM admin_sessions ORDER BY created_at DESC;
```

### 2. Key Metrics

- **Active Sessions**: `SELECT COUNT(*) FROM mining_sessions WHERE status = 'active'`
- **Total Tokens**: `SELECT SUM(rsc_available) FROM balances`
- **Heartbeat Success Rate**: Check mining_events table

### 3. Error Monitoring

- Check Edge Function logs in Supabase Dashboard
- Monitor for failed heartbeats
- Watch for session timeouts

## 🚨 Troubleshooting

### Common Issues

1. **"Unauthorized" errors**
   - Check if user is logged in
   - Verify JWT token is valid
   - Check Edge Function environment variables

2. **"Too many active sessions"**
   - User already has an active session
   - Check mining_sessions table for stuck sessions
   - Manually end old sessions if needed

3. **Heartbeats failing**
   - Check Edge Function logs
   - Verify session_id is correct
   - Check if session is still active

4. **Tokens not updating**
   - Verify RATE_RSC_PER_SEC environment variable
   - Check if update_session_and_balance function exists
   - Monitor mining_events table for heartbeat events

### Debug Steps

1. **Check browser console** for JavaScript errors
2. **Verify Edge Functions** are deployed and accessible
3. **Check database tables** for data consistency
4. **Monitor Edge Function logs** for server-side errors

## 🔄 Migration from Old System

### What to Remove

1. **Old client files**:
   - `scripts/supabaseClient.js` (old version)
   - `scripts/mining-supabase-integration.js` (old version)
   - `supabase-mining-demo.html` (old demo)

2. **Old database tables**:
   - `miners` table
   - `mining_transactions` table

### What to Keep

1. **User data**: Export and migrate user profiles
2. **Balance data**: Transfer to new balances table
3. **Configuration**: Reuse mining parameters

### Migration Script

```sql
-- Example migration (adjust as needed)
INSERT INTO public.profiles (id, email, display_name, created_at)
SELECT 
  gen_random_uuid(),
  email,
  name,
  created_at
FROM old_miners_table;

-- Update balances (if you had them)
UPDATE public.balances b
SET rsc_available = old_balance.amount
FROM old_balances_table old_balance
WHERE b.user_id = old_balance.user_id;
```

## 🎯 Next Steps

### Phase 1 (This Week)
- [ ] Deploy Edge Functions
- [ ] Test basic functionality
- [ ] Verify security measures

### Phase 2 (Next Week)
- [ ] Add admin dashboard
- [ ] Implement leaderboard
- [ ] Add analytics

### Phase 3 (Future)
- [ ] Multi-device support
- [ ] Advanced anti-abuse
- [ ] Mainnet integration

## 📞 Support

If you encounter issues:

1. **Check this README** for troubleshooting steps
2. **Review Edge Function logs** in Supabase Dashboard
3. **Verify database setup** with SQL queries
4. **Test with cURL** to isolate frontend vs backend issues

## 🎉 Success Criteria

The new architecture is working when:

- ✅ Users can sign in with magic links
- ✅ Mining sessions start/stop correctly
- ✅ Heartbeats send every 15 seconds
- ✅ Tokens accumulate in database (not frontend)
- ✅ Sessions timeout after 60s inactivity
- ✅ Users can only see their own data
- ✅ No client-side token calculations

---

**🚀 Ready to deploy the most secure RSC mining system ever built!**
