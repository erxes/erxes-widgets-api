import * as nodemailer from "nodemailer";

export interface IEmail {
  toEmails: string[];
  fromEmail: string;
  title: string;
  content: string;
}

export const sendEmail = (args: IEmail): void => {
  const { toEmails, fromEmail, title, content } = args;
  const { MAIL_SERVICE, MAIL_USER, MAIL_PASS } = process.env;

  const transporter = nodemailer.createTransport({
    service: MAIL_SERVICE,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS
    }
  });

  toEmails.forEach(toEmail => {
    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: title,
      text: content
    };

    transporter.sendMail(mailOptions, (error: Error, info: any) => {
      console.log(error); // eslint-disable-line
      console.log(info); // eslint-disable-line
    });
  });
};
