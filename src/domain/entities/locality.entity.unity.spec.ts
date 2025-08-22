import { ValidatorDomainException } from "../shared/exceptions/validator-domain.exception";
import { Locality } from "./locality.entity";

describe('Domain > Entities > Locality', () => {
  describe('create', () => {
    it('should create a Locality when passing valid locality and password', () => {
      // Arrange
      const aLocality = 'BELÉM';
      const aPassword = '123456';

      // Act
      const anLocality = Locality.create({ locality: aLocality, password: aPassword})

      // Assert
      expect(anLocality).toBeInstanceOf(Locality);
      expect(anLocality.getLocality()).toBe(aLocality);
      expect(anLocality.getPassword()).not.toBe(aPassword);
      expect(anLocality.comparePassword(aPassword)).toBe(true);
      expect(anLocality.getRole()).toBe('user');
      expect(anLocality.getId()).toBeDefined();
      expect(anLocality.getId().length).toBe(36);
      expect(anLocality.getCreatedAt()).toBeInstanceOf(Date);
      expect(anLocality.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should throw an error when passing an invalid locality', () => {
      // Arrange
      const anInvalidLocality = '';
      const anInvalidPassword = '12345678';
      
      // Act
      const anError = () => {
        Locality.create({ locality: anInvalidLocality, password: anInvalidPassword });
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
        Locality.create({ locality: anInvalidLocality, password: anInvalidPassword });
      }

      // Assert
      expect(anError).toThrow(ValidatorDomainException);
    });
  });

  describe('comparePassword', () => {
    it('should return true when the informed password matches with Locality password', () => {
      // Arrange
      const aLocality = 'BELÉM';
      const aPassword = '123456';

      // Act
      const anLocality = Locality.create({ locality: aLocality, password: aPassword });
      
      // Assert
      expect(anLocality.getPassword()).not.toBe(aLocality);

      // Compare password
      const isPasswordCorrect = anLocality.comparePassword(aLocality);

      // Assert
      expect(isPasswordCorrect).toBe(true);
    })

    it('should return false when the informed password does not match with Locality password', () => {
      // Arrange
      const aLocality = 'BELÉM';
      const aPassword = '123456';

      // Act
      const anLocality = Locality.create({ locality: aLocality, password: aPassword});

      // Assert
      expect(anLocality.getPassword()).not.toBe(aPassword)

      // Compare password with wrong password
      const isPasswordCorrect = anLocality.comparePassword('wrong-password');

      // Assert
      expect(isPasswordCorrect).toBe(false);
    })
  })
});