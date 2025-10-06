# Sistema de Upload de Imagens - Configuração e Uso

Este documento descreve como configurar e usar o sistema de upload de imagens implementado no projeto.

## 🚀 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_BUCKET_NAME=images
```

### 2. Instalação de Dependências

Execute o comando para instalar as novas dependências:

```bash
npm install
```

As seguintes dependências foram adicionadas:

- `multer`: Para upload de arquivos
- `sharp`: Para otimização de imagens
- `@types/multer`: Tipos TypeScript para multer

### 3. Configuração do Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Crie um novo bucket chamado `images` (ou use o nome configurado em `SUPABASE_BUCKET_NAME`)
3. Configure as políticas de acesso do bucket:
   - **Public Access**: Para permitir acesso público às imagens
   - **Upload Policy**: Para permitir uploads autenticados

Exemplo de política RLS para o bucket `images`:

```sql
-- Política para permitir uploads autenticados
CREATE POLICY "Users can upload images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Política para permitir acesso público às imagens
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');
```

## 📋 Uso da API

### Endpoint de Upload

**POST** `/events/{eventId}/upload-image`

#### Headers

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### Parâmetros

- `eventId` (path): ID do evento para o qual a imagem será enviada
- `image` (form-data): Arquivo de imagem (JPEG, PNG)

#### Exemplo de Requisição

```bash
curl -X POST \
  http://localhost:3000/events/123e4567-e89b-12d3-a456-426614174000/upload-image \
  -H "Authorization: Bearer your-jwt-token" \
  -F "image=@/path/to/your/image.jpg"
```

#### Exemplo de Resposta

```json
{
  "imageUrl": "https://your-project-id.supabase.co/storage/v1/object/public/images/events/1234567890_abc123.jpg",
  "eventId": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Imagem enviada com sucesso"
}
```

### Validações

- **Tamanho máximo**: 5MB
- **Formatos suportados**: JPEG, PNG
- **Autenticação**: Obrigatória (Bearer token)
- **Autorização**: Apenas ADMIN ou superior podem fazer upload

## 🏗️ Arquitetura

### Serviços Implementados

#### 1. SupabaseStorageService

Serviço genérico para interação com o Supabase Storage:

- `uploadFile()`: Upload de arquivos
- `deleteFile()`: Exclusão de arquivos
- `getPublicUrl()`: Obtenção de URL pública
- `listFiles()`: Listagem de arquivos

#### 2. ImageOptimizerService

Serviço para otimização de imagens:

- `validateImage()`: Validação de formato e tamanho
- `optimizeImage()`: Compressão e otimização
- `generateUniqueFileName()`: Geração de nomes únicos
- `getMimeType()`: Obtenção de tipo MIME

#### 3. UploadEventImageUsecase

Use case específico para upload de imagens de eventos:

- Validação do evento
- Otimização da imagem
- Upload para Supabase
- Atualização do banco de dados

### Estrutura de Pastas

```
src/
├── infra/
│   ├── services/
│   │   ├── supabase/
│   │   │   ├── supabase-storage.service.ts
│   │   │   └── supabase.module.ts
│   │   └── image-optimizer/
│   │       ├── image-optimizer.service.ts
│   │       └── image-optimizer.module.ts
│   └── web/
│       └── routes/
│           └── event/
│               └── upload-image/
│                   ├── upload-event-image.dto.ts
│                   ├── upload-event-image.presenter.ts
│                   └── upload-event-image.route.ts
└── usecases/
    └── event/
        └── upload-image/
            └── upload-event-image.usecase.ts
```

## 🔧 Extensão para Outras Entidades

Para usar o sistema de upload em outras entidades (usuários, regiões, etc.), siga estes passos:

### 1. Atualizar o Schema do Prisma

```prisma
model Users {
  id        String   @id @default(uuid())
  name      String
  imageUrl  String?  @map("image_url")
  // ... outros campos
}
```

### 2. Atualizar a Entidade

```typescript
// src/domain/entities/user.entity.ts
export class User extends Entity {
  // ... outros campos
  private imageUrl: string | undefined;

  public getImageUrl(): string | undefined {
    return this.imageUrl;
  }

  public setImageUrl(imageUrl: string): void {
    this.imageUrl = imageUrl;
  }
}
```

### 3. Criar Use Case

```typescript
// src/usecases/user/upload-image/upload-user-image.usecase.ts
@Injectable()
export class UploadUserImageUsecase
  implements Usecase<UploadUserImageDto, UploadUserImageResult>
{
  constructor(
    private readonly userGateway: UserGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly imageOptimizerService: ImageOptimizerService,
  ) {}

  async execute(dto: UploadUserImageDto): Promise<UploadUserImageResult> {
    // Implementação similar ao UploadEventImageUsecase
    // Usar folderName: 'users' em vez de 'events'
  }
}
```

### 4. Criar Rota

```typescript
// src/infra/web/routes/user/upload-image/upload-user-image.route.ts
@Controller('users')
export class UploadUserImageRoute {
  @Post(':userId/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadUserImagePresenter> {
    // Implementação similar ao UploadEventImageRoute
  }
}
```

## 🧪 Testes

### Exemplo de Teste com cURL

```bash
# 1. Faça login para obter o token
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# 2. Use o token retornado para fazer upload
curl -X POST \
  http://localhost:3000/events/EVENT_ID/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test-image.jpg"
```

### Exemplo de Teste com JavaScript

```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/events/EVENT_ID/upload-image', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const result = await response.json();
console.log('Image URL:', result.imageUrl);
```

## 🚨 Tratamento de Erros

O sistema trata os seguintes tipos de erro:

- **400 Bad Request**: Arquivo inválido, muito grande ou formato não suportado
- **401 Unauthorized**: Token de autenticação inválido
- **403 Forbidden**: Usuário sem permissão para fazer upload
- **404 Not Found**: Evento não encontrado
- **500 Internal Server Error**: Erro interno do servidor

## 📊 Monitoramento

O sistema inclui logs detalhados para monitoramento:

- Upload iniciado/concluído
- Validação de arquivos
- Otimização de imagens
- Erros e exceções

Verifique os logs do aplicativo para acompanhar o funcionamento do sistema.

## 🔒 Segurança

- **Autenticação obrigatória**: Todos os uploads requerem token válido
- **Autorização por roles**: Apenas usuários ADMIN ou superior podem fazer upload
- **Validação de arquivos**: Verificação de tipo e tamanho
- **Nomes únicos**: Prevenção de conflitos e ataques
- **Políticas RLS**: Controle de acesso no Supabase

## 📈 Performance

- **Compressão automática**: Redução significativa do tamanho dos arquivos
- **Formato WEBP**: Compressão otimizada mantendo qualidade
- **Redimensionamento**: Limitação de dimensões para otimização
- **Upload assíncrono**: Não bloqueia outras operações
