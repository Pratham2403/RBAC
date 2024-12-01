const nodemailer = require('nodemailer')
const {
  InternalServerError,
  BadRequestError,
} = require('../../config/apierror')

const { SMTP_EMAIL, SMTP_PASS, SMTP_HOST } = process.env

const transporter = nodemailer.createTransport(
  {
    host: SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASS,
    },
  },
  {
    from: `"WebCSE IIT ISM Dhanbad" <webcseiitism@gmail.com>`,
  }
)

transporter.verify((error) => {
  if (error) {
    throw error
  } else {
    console.log('Ready for message')
  }
})

exports.sendEmail = async (mailOptions) => {
  if (
    !mailOptions ||
    !mailOptions.to ||
    !mailOptions.subject ||
    !mailOptions.html
  ) {
    throw new BadRequestError(
      'Missing required email parameters: to, subject, or html.'
    )
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.log('Error sending email:', error)
    throw new InternalServerError('Failed to send email.')
  }
}
