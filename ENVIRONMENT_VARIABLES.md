# Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_BUCKET_NAME=images

# JWT Configuration
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=1d

# Application
PORT=3000
NODE_ENV=development
```

## Como obter as credenciais do Supabase:

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`

## Configuração do Bucket:

1. No Supabase Dashboard, vá em **Storage**
2. Crie um novo bucket chamado `images`
3. Configure as políticas de acesso conforme documentado em `IMAGE_UPLOAD_SETUP.md`
