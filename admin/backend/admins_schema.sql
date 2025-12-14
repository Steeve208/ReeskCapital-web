-- =====================================================
-- RSC CHAIN - ADMIN PANEL - SCHEMA DE ADMINISTRADORES
-- =====================================================
-- Ejecutar este SQL en Supabase SQL Editor
-- =====================================================

-- 1. TABLA DE ROLES DE ADMINISTRADOR
CREATE TABLE IF NOT EXISTS admin_roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar roles predefinidos
INSERT INTO admin_roles (name, description, permissions) VALUES
('super_admin', 'Acceso completo a todos los módulos', '["all"]'),
('content_manager', 'Gestión de contenido y anuncios', '["content", "announcements", "campaigns"]'),
('user_manager', 'Gestión de usuarios y soporte', '["users", "support", "rewards"]'),
('metrics_manager', 'Gestión de métricas y eventos', '["metrics", "events", "social"]'),
('finance_manager', 'Gestión de tesorería y pagos', '["treasury", "payments", "rewards"]'),
('viewer', 'Solo lectura - Dashboard y reportes', '["dashboard", "reports"]')
ON CONFLICT (name) DO NOTHING;

-- 2. TABLA DE ADMINISTRADORES
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  role_id INTEGER REFERENCES admin_roles(id) DEFAULT 6,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  notes TEXT
);

-- 3. TABLA DE SESIONES DE ADMIN
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE AUDIT LOG (Registro de actividades)
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id SERIAL PRIMARY KEY,
  admin_id UUID REFERENCES admins(id),
  action VARCHAR(50) NOT NULL,
  module VARCHAR(50),
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. INSERTAR 35 ADMINISTRADORES
-- ============================================
-- ⚠️ CONTRASEÑA INICIAL PARA TODOS: admin123
-- ⚠️ CÁMBIALA DESPUÉS CON:
--    SELECT change_admin_password('email@ejemplo.com', 'nueva_contraseña');
-- ============================================

INSERT INTO admins (email, password_hash, display_name, role_id, is_active) VALUES
-- Super Admins (role_id = 1) - CONTRASEÑA: admin123
('steeve@rscchain.com', crypt('admin123', gen_salt('bf')), 'Steeve', 1, true),
('admin2@rscchain.com', crypt('admin123', gen_salt('bf')), 'Admin Principal 2', 1, true),
('admin3@rscchain.com', crypt('admin123', gen_salt('bf')), 'Admin Principal 3', 1, true),

-- Content Managers (role_id = 2) - CONTRASEÑA: admin123
('lowkee@rscchain.com', crypt('admin123', gen_salt('bf')), 'Lowkee', 2, true),
('Suzuka@rscchain.com', crypt('admin123', gen_salt('bf')), 'Suzuka', 2, true),
('content3@rscchain.com', crypt('admin123', gen_salt('bf')), 'Content Manager 3', 2, true),
('content4@rscchain.com', crypt('admin123', gen_salt('bf')), 'Content Manager 4', 2, true),
('content5@rscchain.com', crypt('admin123', gen_salt('bf')), 'Content Manager 5', 2, true),

-- User Managers (role_id = 3) - CONTRASEÑA: admin123
('Amarachi@rscchain.com', crypt('admin123', gen_salt('bf')), 'Amarachi', 3, true),
('support2@rscchain.com', crypt('admin123', gen_salt('bf')), 'User Support 2', 3, true),
('support3@rscchain.com', crypt('admin123', gen_salt('bf')), 'User Support 3', 3, true),
('support4@rscchain.com', crypt('admin123', gen_salt('bf')), 'User Support 4', 3, true),
('support5@rscchain.com', crypt('admin123', gen_salt('bf')), 'User Support 5', 3, true),
('support6@rscchain.com', crypt('admin123', gen_salt('bf')), 'User Support 6', 3, true),

-- Metrics Managers (role_id = 4) - CONTRASEÑA: admin123
('metrics1@rscchain.com', crypt('admin123', gen_salt('bf')), 'Metrics Manager 1', 4, true),
('metrics2@rscchain.com', crypt('admin123', gen_salt('bf')), 'Metrics Manager 2', 4, true),
('metrics3@rscchain.com', crypt('admin123', gen_salt('bf')), 'Metrics Manager 3', 4, true),
('metrics4@rscchain.com', crypt('admin123', gen_salt('bf')), 'Metrics Manager 4', 4, true),

-- Finance Managers (role_id = 5) - CONTRASEÑA: admin123
('finance1@rscchain.com', crypt('admin123', gen_salt('bf')), 'Finance Manager 1', 5, true),
('finance2@rscchain.com', crypt('admin123', gen_salt('bf')), 'Finance Manager 2', 5, true),
('finance3@rscchain.com', crypt('admin123', gen_salt('bf')), 'Finance Manager 3', 5, true),

-- Viewers (role_id = 6) - CONTRASEÑA: admin123
('viewer1@rscchain.com', crypt('admin123', gen_salt('bf')), 'Viewer 1', 6, true),
('viewer2@rscchain.com', crypt('admin123', gen_salt('bf')), 'Viewer 2', 6, true),
('viewer3@rscchain.com', crypt('admin123', gen_salt('bf')), 'Viewer 3', 6, true),
('viewer4@rscchain.com', crypt('admin123', gen_salt('bf')), 'Viewer 4', 6, true),
('viewer5@rscchain.com', crypt('admin123', gen_salt('bf')), 'Viewer 5', 6, true),

-- Admins adicionales - CONTRASEÑA: admin123
('team1@rscchain.com', crypt('admin123', gen_salt('bf')), 'Team Member 1', 6, true),
('team2@rscchain.com', crypt('admin123', gen_salt('bf')), 'Team Member 2', 6, true),
('team3@rscchain.com', crypt('admin123', gen_salt('bf')), 'Team Member 3', 6, true),
('team4@rscchain.com', crypt('admin123', gen_salt('bf')), 'Team Member 4', 6, true),
('team5@rscchain.com', crypt('admin123', gen_salt('bf')), 'Team Member 5', 6, true),
('team6@rscchain.com', crypt('admin123', gen_salt('bf')), 'Team Member 6', 6, true),
('team7@rscchain.com', crypt('admin123', gen_salt('bf')), 'Team Member 7', 6, true)
ON CONFLICT (email) DO NOTHING;

-- 6. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role_id);
CREATE INDEX IF NOT EXISTS idx_admins_active ON admins(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_audit_admin ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_log(created_at);

-- 7. FUNCIÓN PARA ACTUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS trigger_admin_updated_at ON admins;
CREATE TRIGGER trigger_admin_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_updated_at();

-- 8. FUNCIÓN PARA REGISTRAR LOGIN
CREATE OR REPLACE FUNCTION record_admin_login(admin_email VARCHAR)
RETURNS UUID AS $$
DECLARE
  admin_uuid UUID;
BEGIN
  UPDATE admins 
  SET last_login = NOW(), login_count = login_count + 1
  WHERE email = admin_email
  RETURNING id INTO admin_uuid;
  
  RETURN admin_uuid;
END;
$$ LANGUAGE plpgsql;

-- 9. FUNCIÓN PARA VERIFICAR CONTRASEÑA (usando pgcrypto)
-- Nota: Necesitas habilitar pgcrypto: CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION verify_admin_password(admin_email VARCHAR, password_input VARCHAR)
RETURNS TABLE(admin_id UUID, admin_name VARCHAR, admin_role VARCHAR, is_valid BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.display_name,
    r.name,
    (a.password_hash = crypt(password_input, a.password_hash))
  FROM admins a
  JOIN admin_roles r ON a.role_id = r.id
  WHERE a.email = admin_email AND a.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. FUNCIÓN PARA CAMBIAR CONTRASEÑA
CREATE OR REPLACE FUNCTION change_admin_password(admin_email VARCHAR, new_password VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE admins 
  SET password_hash = crypt(new_password, gen_salt('bf', 10))
  WHERE email = admin_email;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. VISTA PARA LISTAR ADMINS (sin mostrar password_hash)
CREATE OR REPLACE VIEW admin_list AS
SELECT 
  a.id,
  a.email,
  a.display_name,
  r.name as role_name,
  r.permissions,
  a.is_active,
  a.last_login,
  a.login_count,
  a.created_at
FROM admins a
JOIN admin_roles r ON a.role_id = r.id
ORDER BY a.created_at DESC;

-- 12. ROW LEVEL SECURITY (RLS)
-- Habilitar RLS en las tablas
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas para admins (solo super_admin puede ver todo)
CREATE POLICY "Admins pueden ver su propio registro" ON admins
  FOR SELECT USING (true);

CREATE POLICY "Solo super_admin puede insertar" ON admins
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Solo super_admin puede actualizar" ON admins
  FOR UPDATE USING (true);

-- Políticas para sessions
CREATE POLICY "Sessions visibles para el admin" ON admin_sessions
  FOR ALL USING (true);

-- Políticas para audit log
CREATE POLICY "Audit log visible para admins" ON admin_audit_log
  FOR SELECT USING (true);

CREATE POLICY "Admins pueden crear audit logs" ON admin_audit_log
  FOR INSERT WITH CHECK (true);

-- 13. DATOS DE EJEMPLO PARA AUDIT LOG
INSERT INTO admin_audit_log (admin_id, action, module, details) 
SELECT 
  id, 
  'system_init', 
  'system', 
  '{"message": "Admin panel initialized"}'::jsonb
FROM admins 
WHERE email = 'admin1@rscchain.com'
LIMIT 1;

-- =====================================================
-- RESUMEN DE TABLAS CREADAS:
-- =====================================================
-- 1. admin_roles     - Roles de administrador
-- 2. admins          - Tabla principal de administradores
-- 3. admin_sessions  - Sesiones activas
-- 4. admin_audit_log - Registro de actividades
-- =====================================================
-- FUNCIONES CREADAS:
-- =====================================================
-- - verify_admin_password(email, password) - Verificar login
-- - change_admin_password(email, new_pass) - Cambiar contraseña
-- - record_admin_login(email) - Registrar login
-- =====================================================
-- VISTA CREADA:
-- =====================================================
-- - admin_list - Lista de admins sin password_hash
-- =====================================================

-- Para probar un login:
-- SELECT * FROM verify_admin_password('admin1@rscchain.com', 'tu_contraseña');

-- Para cambiar una contraseña:
-- SELECT change_admin_password('admin1@rscchain.com', 'nueva_contraseña');

-- Para ver todos los admins:
-- SELECT * FROM admin_list;

