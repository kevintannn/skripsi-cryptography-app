import { transporter } from "@/config/nodemailer";

const email = process.env.EMAIL;

const handler = async (req, res) => {
  if (req.method == "POST") {
    const data = req.body;
    const instruction =
      "Head to https://blabla.com to decrypt using the passkey sent to your phone number!";
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Document</title>
          <style>
            .the-div {
              display: flex;
              flex-direction: column;
            }
      
            .the-div2 {
              padding: 20px;
              background-color: lightgray;
              margin-bottom: 20px;
            }
      
            .the-pre {
              white-space: pre-wrap;
              word-break: break-all;
            }
          </style>
        </head>
      
        <body>
          <div class="the-div">
            <div class="the-div2">
              <pre class="the-pre">${data.text}</pre>
            </div>
      
            <p>${instruction}</p>
          </div>
        </body>
      </html>
      `;

    let mailObject = {
      from: email,
      to: data.recipientEmail,
      subject: "New Message",
      html: htmlContent,
    };

    if (data.fileURL) {
      mailObject = {
        ...mailObject,
        attachments: [
          {
            filename: "enc.txt",
            path: data.fileURL,
          },
        ],
      };
    }

    try {
      await transporter.sendMail(mailObject);

      return res.status(200).json({ success: true });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: error.message });
    }
  }

  return res.status(400).json({ message: "Bad request" });
};

export default handler;
