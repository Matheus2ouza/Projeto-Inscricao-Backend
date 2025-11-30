import { ValidatorDomainException } from '../shared/exceptions/validator-domain.exception';
import { Account } from './account.entity';

describe('Domain > Entities > User', () => {
  describe('create', () => {
    it('should create a User when passing valid user and password', () => {
      // Arrange
      const aUsername = 'BELÉM';
      const aPassword = '123456';

      // Act
      const anUser = Account.create({
        username: aUsername,
        password: aPassword,
      });

      // Assert
      expect(anUser).toBeInstanceOf(Account);
      expect(anUser.getUsername()).toBe(aUsername);
      expect(anUser.getPassword()).not.toBe(aPassword);
      expect(anUser.comparePassword(aPassword)).toBe(true);
      expect(anUser.getRole()).toBe('user');
      expect(anUser.getId()).toBeDefined();
      expect(anUser.getId().length).toBe(36);
      expect(anUser.getCreatedAt()).toBeInstanceOf(Date);
      expect(anUser.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should throw an error when passing an invalid user', () => {
      // Arrange
      const anInvalidUser = '';
      const anInvalidPassword = '12345678';

      // Act
      const anError = () => {
        Account.create({
          username: anInvalidUser,
          password: anInvalidPassword,
        });
      };

      // Assert
      expect(anError).toThrow(ValidatorDomainException);
    });

    it('should throw an error when passing an invalid password', () => {
      // Arrange
      const anInvalidUsser = 'BELÉM';
      const anInvalidPassword = '1234';

      // Act
      const anError = () => {
        Account.create({
          username: anInvalidUsser,
          password: anInvalidPassword,
        });
      };

      // Assert
      expect(anError).toThrow(ValidatorDomainException);
    });
  });

  describe('comparePassword', () => {
    it('should return true when the informed password matches with User password', () => {
      // Arrange
      const aUser = 'BELÉM';
      const aPassword = '123456';

      // Act
      const anUser = Account.create({
        username: aUser,
        password: aPassword,
      });

      // Assert
      expect(anUser.getPassword()).not.toBe(aUser);

      // Compare password
      const isPasswordCorrect = anUser.comparePassword(aUser);

      // Assert
      expect(isPasswordCorrect).toBe(true);
    });

    it('should return false when the informed password does not match with User password', () => {
      // Arrange
      const aUser = 'BELÉM';
      const aPassword = '123456';

      // Act
      const anUser = Account.create({
        username: aUser,
        password: aPassword,
      });

      // Assert
      expect(anUser.getPassword()).not.toBe(aPassword);

      // Compare password with wrong password
      const isPasswordCorrect = anUser.comparePassword('wrong-password');

      // Assert
      expect(isPasswordCorrect).toBe(false);
    });
  });
});
