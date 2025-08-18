import { ValidatorDomainException } from "../shared/exceptions/validator-domain.exception";
import { User } from "./user.entity";

describe('Domain > Entities > User', () => {
  describe('create', () => {
    it('should create a user when passing valid locality and password', () => {
      // Arrange
      const anLocality = 'BELÉM';
      const anPassword = '123456';

      // Act
      const anUser = User.create({ locality: anLocality, password: anPassword})

      // Assert
      expect(anUser).toBeInstanceOf(User);
      expect(anUser.getLocality()).toBe(anLocality);
      expect(anUser.getPassword()).not.toBe(anPassword);
      expect(anUser.comparePassword(anPassword)).toBe(true);
      expect(anUser.getRole()).toBe('user');
      expect(anUser.getId()).toBeDefined();
      expect(anUser.getId().length).toBe(36);
      expect(anUser.getCreatedAt()).toBeInstanceOf(Date);
      expect(anUser.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should throw an error when passing an invalid locality', () => {
      // Arrange
      const anInvalidLocality = '';
      const anInvalidPassword = '12345678';
      
      // Act
      const anError = () => {
        User.create({ locality: anInvalidLocality, password: anInvalidPassword });
      }

      // Assert
      expect(anError).toThrow(ValidatorDomainException);
    });

    it('should throw an error when passing an invalid password', () => {
      // Arrange
      const anInvalidLocality = 'BELÉM';
      const anInvalidPassword = '1234';
      
      // Act
      const anError = () => {
        User.create({ locality: anInvalidLocality, password: anInvalidPassword });
      }

      // Assert
      expect(anError).toThrow(ValidatorDomainException);
    });
  });

  describe('comparePassword', () => {
    it('should return true when the informed password matches with user password', () => {
      // Arrange
      const anLocality = 'BELÉM';
      const anPassword = '123456';

      // Act
      const anUser = User.create({ locality: anLocality, password: anPassword });
      
      // Assert
      expect(anUser.getPassword()).not.toBe(anPassword);

      // Compare password
      const isPasswordCorrect = anUser.comparePassword(anPassword);

      // Assert
      expect(isPasswordCorrect).toBe(true);
    })

    it('should return false when the informed password does not match with user password', () => {
      // Arrange
      const anLocality = 'BELÉM';
      const anPassword = '123456';

      // Act
      const anUser = User.create({ locality: anLocality, password: anPassword});

      // Assert
      expect(anUser.getPassword()).not.toBe(anPassword)

      // Compare password with wrong password
      const isPasswordCorrect = anUser.comparePassword('wrong-password');

      // Assert
      expect(isPasswordCorrect).toBe(false);
    })
  })
});