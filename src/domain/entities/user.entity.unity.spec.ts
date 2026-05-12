import { roleType } from 'generated/prisma';
import { ValidatorDomainException } from '../shared/exceptions/validator-domain.exception';
import { Account } from './account.entity';

describe('Domínio > Entidades > Usuário', () => {
  describe('criar', () => {
    it('deve criar um usuário quando receber usuário e senha válidos', () => {
      // Preparação
      const aUsername = 'BELÉM';
      const aPassword = '123456';
      const aRole = roleType.USER;
      const anEmail = 'belem@example.com';

      // Ação
      const anUser = Account.create({
        username: aUsername,
        password: aPassword,
        role: aRole,
        email: anEmail,
      });

      // Verificação
      expect(anUser).toBeInstanceOf(Account);
      expect(anUser.getUsername()).toBe(aUsername);
      expect(anUser.getPassword()).not.toBe(aPassword);
      expect(anUser.comparePassword(aPassword)).toBe(true);
      expect(anUser.getRole()).toBe(aRole);
      expect(anUser.getEmail()).toBe(anEmail);
      expect(anUser.getId()).toBeDefined();
      expect(anUser.getId().length).toBe(36);
      expect(anUser.getCreatedAt()).toBeInstanceOf(Date);
      expect(anUser.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('deve lançar erro quando receber um usuário inválido', () => {
      // Preparação
      const anInvalidUser = '';
      const anInvalidPassword = '12345678';

      // Ação
      const anError = () => {
        Account.create({
          username: anInvalidUser,
          password: anInvalidPassword,
          role: roleType.USER,
          email: 'belem@example.com',
        });
      };

      // Verificação
      expect(anError).toThrow(ValidatorDomainException);
    });

    it('deve lançar erro quando receber uma senha inválida', () => {
      // Preparação
      const anInvalidUsser = 'BELÉM';
      const anInvalidPassword = '1234';

      // Ação
      const anError = () => {
        Account.create({
          username: anInvalidUsser,
          password: anInvalidPassword,
          role: roleType.USER,
          email: 'belem@example.com',
        });
      };

      // Verificação
      expect(anError).toThrow(ValidatorDomainException);
    });
  });

  describe('comparar senha', () => {
    it('deve retornar true quando a senha informada corresponder à senha do usuário', () => {
      // Preparação
      const aUser = 'BELÉM';
      const aPassword = '123456';
      const aRole = roleType.USER;
      const anEmail = 'belem@example.com';

      // Ação
      const anUser = Account.create({
        username: aUser,
        password: aPassword,
        role: aRole,
        email: anEmail,
      });

      // Verificação
      expect(anUser.getPassword()).not.toBe(aPassword);

      // Compara a senha
      const isPasswordCorrect = anUser.comparePassword(aPassword);

      // Verificação
      expect(isPasswordCorrect).toBe(true);
    });

    it('deve retornar false quando a senha informada não corresponder à senha do usuário', () => {
      // Preparação
      const aUser = 'BELÉM';
      const aPassword = '123456';
      const aRole = roleType.USER;
      const anEmail = 'belem@example.com';

      // Ação
      const anUser = Account.create({
        username: aUser,
        password: aPassword,
        role: aRole,
        email: anEmail,
      });

      // Verificação
      expect(anUser.getPassword()).not.toBe(aPassword);

      // Compara com uma senha incorreta
      const isPasswordCorrect = anUser.comparePassword('wrong-password');

      // Verificação
      expect(isPasswordCorrect).toBe(false);
    });
  });
});
