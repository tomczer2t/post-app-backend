export const changeEmailTemplate = (
  username: string,
  verificationCode: string,
  newEmail: string,
) => {
  return `
  <div style='text-align: center'>
    <h3>Hi ${username},</h3>
    <p>Confirm email change to ${newEmail}.</p>
    <a style='background-color: #006fff; border-radius: 9999px; padding: 10px 25px' href='http://localhost:3000/account/verify/email/${verificationCode}'>
      Confirm new email
    </a></br>
    <small>If you did not change an email, contact with us.</small>
  </div>
`;
};
