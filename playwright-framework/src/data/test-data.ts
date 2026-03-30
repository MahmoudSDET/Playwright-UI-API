import testData from './test-data.json';

export const { credentials, products, checkout, messages, urls } = testData;

export const registration = {
  defaults: testData.registration,
  buildPayload(uniqueId: string) {
    const r = testData.registration;
    return {
      firstName: r.firstName,
      lastName: r.lastName,
      userEmail: r.emailTemplate.replace('{{uniqueId}}', uniqueId),
      userPassword: r.password,
      confirmPassword: r.confirmPassword,
      userMobile: r.phone,
      occupation: r.occupation,
      gender: r.gender,
      required18: r.required18,
    };
  },
};
