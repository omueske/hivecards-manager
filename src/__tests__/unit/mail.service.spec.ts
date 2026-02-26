// the global setup mocks MailService; undo it for this spec so we test real class
jest.unmock('../../mail/mail.service');
import { MailService } from '../../mail/mail.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('MailService (unit)', () => {
  let mailer: jest.Mocked<MailerService>;
  let service: MailService;

  beforeEach(() => {
    mailer = { sendMail: jest.fn() } as any;
    service = new MailService(mailer as any);
  });

  it('sends verification email successfully', async () => {
    mailer.sendMail.mockResolvedValue({});
    await expect(service.sendVerificationEmail('user@example.com', 'token123', 'John')).resolves.toBeUndefined();
    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: expect.stringContaining('bestätigen'),
        template: 'verify-email',
        context: expect.objectContaining({ 
          link: expect.stringContaining('token123'),
          username: 'John'
        }),
      }),
    );
  });

  it('propagates error when verification mail fails', async () => {
    const err = new Error('smtp down');
    mailer.sendMail.mockRejectedValue(err);
    await expect(service.sendVerificationEmail('u@e.com', 't')).rejects.toThrow(err);
  });

  it('sends password reset email successfully', async () => {
    mailer.sendMail.mockResolvedValue({});
    await expect(service.sendPasswordResetEmail('foo@bar.com', 'xyz', 'Jane')).resolves.toBeUndefined();
    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'foo@bar.com',
        subject: expect.stringContaining('Passwort'),
        template: 'reset-password',
        context: expect.objectContaining({ 
          link: expect.stringContaining('xyz'),
          username: 'Jane'
        }),
      }),
    );
  });

  it('propagates error when reset mail fails', async () => {
    const err = new Error('boom');
    mailer.sendMail.mockRejectedValue(err);
    await expect(service.sendPasswordResetEmail('a@b', 'tok')).rejects.toThrow(err);
  });

  it('sends verification email without username (backward compatibility)', async () => {
    mailer.sendMail.mockResolvedValue({});
    await expect(service.sendVerificationEmail('user@example.com', 'token123')).resolves.toBeUndefined();
    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        template: 'verify-email',
        context: expect.objectContaining({ 
          link: expect.stringContaining('token123'),
          username: undefined
        }),
      }),
    );
  });

  it('sends password reset email without username (backward compatibility)', async () => {
    mailer.sendMail.mockResolvedValue({});
    await expect(service.sendPasswordResetEmail('foo@bar.com', 'xyz')).resolves.toBeUndefined();
    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'foo@bar.com',
        template: 'reset-password',
        context: expect.objectContaining({ 
          link: expect.stringContaining('xyz'),
          username: undefined
        }),
      }),
    );
  });
});