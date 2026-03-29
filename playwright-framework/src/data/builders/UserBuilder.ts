import { CreateUserRequest } from '../../api/models/UserModels';

/**
 * Builder pattern for constructing user test data.
 */
export class UserBuilder {
  private data: CreateUserRequest = {
    firstName: 'Test',
    lastName: 'User',
    userEmail: 'testuser@example.com',
    userPassword: 'Test@12345',
    confirmPassword: 'Test@12345',
    userMobile: '1234567890',
    occupation: 'Student',
    gender: 'Male',
    required18: true,
  };

  withEmail(email: string): this {
    this.data.userEmail = email;
    return this;
  }

  withPassword(password: string): this {
    this.data.userPassword = password;
    this.data.confirmPassword = password;
    return this;
  }

  withFirstName(firstName: string): this {
    this.data.firstName = firstName;
    return this;
  }

  withLastName(lastName: string): this {
    this.data.lastName = lastName;
    return this;
  }

  withPhone(phone: string): this {
    this.data.userMobile = phone;
    return this;
  }

  withOccupation(occupation: string): this {
    this.data.occupation = occupation;
    return this;
  }

  withGender(gender: string): this {
    this.data.gender = gender;
    return this;
  }

  build(): CreateUserRequest {
    return { ...this.data };
  }
}
