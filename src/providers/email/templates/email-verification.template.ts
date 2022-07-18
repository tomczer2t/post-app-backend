export const emailVerificationTemplate = (
  username: string,
  verificationCode: string,
) => {
  return `
  <div style='text-align: center'>
    <h3>Hi ${username},</h3>
    <p>We're happy you signed up for CloudApp. To start using your account please confirm your email address.</p>
    <a style='background-color: #006fff; border-radius: 9999px; padding: 10px 25px' href='http://localhost:3000/account/verify/${verificationCode}'>
      Verify email address
    </a>
    <small>If you did not crete an account, no further action is required.</small>
    <p>Welcome to CloudApp!</p>
    <small>If verification button doesn't work, copy and paste the following link <br> <a href='http://localhost:3000/account/verify/${verificationCode}'>http://localhost:3000/account/verify/${verificationCode}</a></small>
  </div>
`;
};
