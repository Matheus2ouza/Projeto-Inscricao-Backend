<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Tela de Criação de Eventos

### Endpoint

```
POST /event/create
```

### Permissão

Somente usuários com papel **ADMIN** podem criar eventos.

### Payload esperado

O corpo da requisição deve ser enviado em JSON:

```
{
  "name": "Nome do evento",
  "eventDate": "2025-10-05T00:00:00.000Z",
  "regionId": "id-da-regiao",
  "image": "<opcional: base64 ou url da imagem>"
}
```

- `name` (string): Nome do evento (obrigatório)
- `eventDate` (string, formato ISO): Data do evento (obrigatório)
- `regionId` (string): ID da região associada (obrigatório)
- `image` (string, opcional): Imagem do evento (pode ser base64, url, ou omitido)

### Resposta de sucesso

Status: `201 Created`

```json
{
  "id": "id-do-evento-criado"
}
```

### Respostas de erro

- `400 Bad Request`: Dados inválidos ou falta de permissão.

### Observações para o Frontend

- O campo `image` é opcional. Caso deseje enviar uma imagem, envie como string (base64 ou url, conforme combinado com o backend).
- O campo `eventDate` deve estar em formato ISO (exemplo: `2025-10-05T00:00:00.000Z`).
- O usuário autenticado deve possuir permissão de ADMIN.

### Exemplo de requisição

```json
{
  "name": "Festa de Lançamento",
  "startDate": "2025-10-10T20:00:00.000Z",
  "endDate": "2025-10-15T20:00:00.000Z",
  "regionId": "cln1x2y3z4",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

### Fluxo resumido da tela

1. Usuário preenche nome, data e região do evento.
2. (Opcional) Seleciona uma imagem para o evento.
3. Ao submeter, a tela faz um POST para `/event/create` com os dados acima.
4. Se sucesso, exibe mensagem de sucesso e ID do evento criado.
5. Se erro, exibe mensagem de erro retornada pela API.

## Docker

Este projeto inclui configurações Docker otimizadas para reduzir significativamente o tamanho das imagens.

### 📊 Comparação de Tamanhos

| Versão     | Tamanho | Redução   |
| ---------- | ------- | --------- |
| Original   | 750MB   | -         |
| Distroless | 546MB   | 27% menor |
| Alpine     | 558MB   | 26% menor |

### 🚀 Build e Execução

```bash
# Build da versão otimizada (recomendada)
docker build -f Dockerfile.optimized -t api-inscricao-nest:optimized .

# Build da versão Alpine
docker build -f Dockerfile.alpine -t api-inscricao-nest:alpine .

# Executar container
docker run -p 3000:3000 api-inscricao-nest:optimized
```

### 📋 Script Automatizado

```bash
# Executa todos os builds e mostra comparação
./build-docker.sh
```

### 🐳 Docker Compose (Heroku Eco Dyno)

Para simular um ambiente Heroku Eco Dyno com limites de recursos:

```bash
# Usando o script automatizado (recomendado)
./docker-compose.sh build    # Constrói a imagem
./docker-compose.sh up       # Inicia a aplicação
./docker-compose.sh status   # Verifica status
./docker-compose.sh logs     # Mostra logs

# Ou usando docker-compose diretamente
docker-compose up -d
```

#### 📊 Recursos Limitados (Heroku Eco Dyno)

- **Memória**: 512MB máximo
- **CPU**: 0.5 cores (50% de um core)
- **Restart**: Automático em caso de falha
- **Segurança**: Modo não privilegiado

### 📖 Documentação Completa

Para informações detalhadas sobre as otimizações Docker, consulte [DOCKER_OPTIMIZATION.md](./DOCKER_OPTIMIZATION.md).

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
