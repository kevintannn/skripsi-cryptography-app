import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const handler = async (req, res) => {
  const client = twilio(accountSid, authToken);

  if (req.method == "POST") {
    const data = req.body;
    let errorFlag = false;

    await client.messages
      .create({
        from: "+13184968681",
        to: data.phone,
        body: data.body,
      })
      .then((message) => console.log(message.sid))
      .catch((error) => {
        errorFlag = true;
      });

    if (errorFlag) {
      return res
        .status(200)
        .json({ success: false, message: "something went wrong" });
    }

    return res.status(200).json({ success: true });
  }
  return res.status(404).json({ success: false, message: "404 not found" });
};

export default handler;
