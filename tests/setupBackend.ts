// global setup for backend Jest projects
// any common mocks or environment configuration goes here

// ensure environment variables used by services are defined
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.COOKIE_SECURE = 'false';

// globally mock MailService so individual tests don't need to override it
jest.mock('../src/mail/mail.service', () => {
  return {
    MailService: jest.fn().mockImplementation(() => ({
      sendVerificationEmail: jest.fn().mockResolvedValue(null),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(null),
    })),
  };
});

// optionally configure mongoose mocking library here if necessary
