/**
 * EN: Interface representing a physical address.
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * EN: Builder pattern for constructing address test data step by step.
 */
export class AddressBuilder {
  // EN: Default address data | AR: Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø§ÙØªØ±Ø§Ø¶ÙŠØ©
  private data: Address = {
    street: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    country: 'US',
  };

  // EN: Set street | AR: ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ø´Ø§Ø±Ø¹
  withStreet(street: string): this {
    this.data.street = street;
    return this;
  }

  // EN: Set city | AR: ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©
  withCity(city: string): this {
    this.data.city = city;
    return this;
  }

  // EN: Set state | AR: ØªØ¹ÙŠÙŠÙ† Ø§Ù„ÙˆÙ„Ø§ÙŠØ©
  withState(state: string): this {
    this.data.state = state;
    return this;
  }

  // EN: Set ZIP code | AR: ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ø±Ù…Ø² Ø§Ù„Ø¨Ø±ÙŠØ¯ÙŠ
  withZipCode(zipCode: string): this {
    this.data.zipCode = zipCode;
    return this;
  }

  // EN: Set country | AR: ØªØ¹ÙŠÙŠÙ† Ø§Ù„Ø¯ÙˆÙ„Ø©
  withCountry(country: string): this {
    this.data.country = country;
    return this;
  }

  // EN: Build and return a copy of the address | AR: Ø¨Ù†Ø§Ø¡ ÙˆØ¥Ø±Ø¬Ø§Ø¹ Ù†Ø³Ø®Ø© Ù…Ù† Ø§Ù„Ø¹Ù†ÙˆØ§Ù†
  build(): Address {
    return { ...this.data };
  }
}
