export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Builder pattern for constructing address test data.
 */
export class AddressBuilder {
  private data: Address = {
    street: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    country: 'US',
  };

  withStreet(street: string): this {
    this.data.street = street;
    return this;
  }

  withCity(city: string): this {
    this.data.city = city;
    return this;
  }

  withState(state: string): this {
    this.data.state = state;
    return this;
  }

  withZipCode(zipCode: string): this {
    this.data.zipCode = zipCode;
    return this;
  }

  withCountry(country: string): this {
    this.data.country = country;
    return this;
  }

  build(): Address {
    return { ...this.data };
  }
}
