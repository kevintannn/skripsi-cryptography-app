import NextHead from "@/components/NextHead";
import Link from "next/link";
import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { BASE_URL } from "@/config/constants";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";

export default function Home() {
  const [passkey, setPasskey] = useState("");
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("");
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+62");
  const [ciphertext, setCiphertext] = useState(null);
  const [message, setMessage] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(null);
  const [asciis, setAsciis] = useState([]);

  const [passkeyError, setPasskeyError] = useState(null);
  const [textError, setTextError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [phoneError, setPhoneError] = useState(null);

  const [loading, setLoading] = useState(false);

  const axiosModeWriteText = async () => {
    setLoading(true);

    await axios
      .post(BASE_URL + "/encrypt", {
        plaintext: text,
        passkey: passkey,
      })
      .then((res) => {
        if (res.data.ciphertext) {
          setLoadingMessage(
            `Finish encrypting in ${res.data.encryption_time} second(s). Sending email...`,
          );
          setCiphertext(res.data.ciphertext);

          axios
            .post("/api/sendEmail", {
              text:
                res.data.ciphertext +
                " | head to https://blabla.com to decrypt using the passkey sent to your phone number",
              recipientEmail: email,
            })
            .then((res) => {
              console.log(res.data);
              if (res.data.success) {
                setLoadingMessage(
                  "Email sent. Sending passkey to phone number...",
                );

                axios
                  .post("/api/sendSMS", {
                    phone: phone,
                    body: "Your passkey: " + passkey,
                  })
                  .then((res) => {
                    console.log(res.data);
                    if (res.data.success) {
                      setMessage(
                        "Encrypted file sent to recipient's email and passkey sent to recipient's phone number!",
                      );
                    } else {
                      setMessage("Failed. Something is wrong.");
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  })
                  .finally(() => {
                    setLoading(false);
                    setLoadingMessage(null);
                  });
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setPasskey("");
        setText("");
        setEmail("");
        setPhone("");
      });
  };

  const axiosModeUploadFile = async () => {
    setLoading(true);
    setLoadingMessage("Encrypting...");

    const formData = new FormData();
    formData.append("passkey", passkey);
    formData.append("file", file);
    formData.append("recipient_email", email);

    await axios
      .post(BASE_URL + "/encrypt-file", formData)
      .then((res) => {
        if (res.data.file_path) {
          setLoadingMessage(
            `Encrypted in ${res.data.encryption_time} second(s), sending email...`,
          );

          axios
            .post(BASE_URL + "/send-email-with-attachment", {
              recipient_email: email,
              file_path: res.data.file_path,
            })
            .then((res) => {
              console.log(res.data);
              if (res.data == "success") {
                axios
                  .post("/api/sendSMS", {
                    phone: phone,
                    body: "Your passkey: " + passkey,
                  })
                  .then((res) => {
                    console.log(res.data);
                    if (res.data.success) {
                      setMessage(
                        "Encrypted file sent to recipient's email and passkey sent to recipient's phone number!",
                      );
                    } else {
                      setMessage("Failed. Something is wrong.");
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  })
                  .finally(() => {
                    setLoading(false);
                    setLoadingMessage(null);
                  });
              } else {
                setMessage(
                  "Encrypted file is too big to be sent through gmail!",
                );
              }
            })
            .catch((err) => {
              console.log(err);
            })
            .finally(() => {
              setLoading(false);
              setLoadingMessage(null);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setFile(null);
        setPasskey("");
        setEmail("");
        setPhone("");
      });
  };

  const handleSend = async () => {
    if (passkey == "" || mode == "" || email == "" || phone == "") {
      return;
    }

    if (passkeyError || emailError || phoneError) {
      return;
    }

    if (mode == "write-text") {
      if (text == "" || textError) {
        return;
      }

      await axiosModeWriteText();
    } else if (mode == "upload-file") {
      if (!file) {
        return;
      }

      await axiosModeUploadFile();
    }
  };

  const handleFileInput = (e) => {
    setFile(e.target.files[0]);
  };

  // const generateKey = () => {
  //   const min = 10000000000000;
  //   const max = 99999999999999;
  //   const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  //   const randomNum2 = Math.floor(Math.random() * (max - min + 1)) + min;
  //   const passkey = randomNum.toString();
  //   const passkey2 = randomNum2.toString();

  //   setPasskey(passkey);
  //   setPasskey2(passkey2);
  // };

  const generateKey = () => {
    const lenAsciis = asciis.length;
    let passkey = "";

    for (let i = 0; i < 10; i++) {
      const seed = Math.floor(Math.random() * lenAsciis);
      passkey += String.fromCharCode(asciis[seed]);
    }

    setPasskey(passkey);
  };

  useEffect(() => {
    if (phone == "") {
      setPhoneError(null);
      return;
    }

    if (!phone.startsWith("+62")) {
      setPhoneError("Phone number must starts with +62");
    } else {
      setPhoneError(null);
    }
  }, [phone]);

  useEffect(() => {
    if (email == "") {
      setEmailError(null);
      return;
    }

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) == false) {
      setEmailError("Invalid email format");
    } else {
      setEmailError(null);
    }
  }, [email]);

  useEffect(() => {
    if (text == "") {
      setTextError(null);
      return;
    }
  }, [text]);

  useEffect(() => {
    setText("");
    setFile(null);
    setCiphertext(null);
  }, [mode]);

  useEffect(() => {
    setPasskey(passkey.trim());

    if (passkey == "") {
      setPasskeyError(null);
      return;
    }

    if (passkey.length < 10 || passkey.length > 10) {
      setPasskeyError("Passkey must be 10 characters");
    } else {
      setPasskeyError(null);
    }
  }, [passkey]);

  useEffect(() => {
    const asciis = [];
    for (let i = 48; i <= 57; i++) {
      asciis.push(i);
    }
    for (let i = 65; i <= 90; i++) {
      asciis.push(i);
    }
    for (let i = 97; i <= 122; i++) {
      asciis.push(i);
    }
    setAsciis(asciis);
  }, []);

  return (
    <>
      <NextHead title="Encrypt" />

      {loading ? (
        <LoadingSpinner loadingMessage={loadingMessage} />
      ) : (
        <div className="p-5 px-10 flex flex-col space-y-3">
          {message && <Toast message={message} setMessage={setMessage} />}

          <p className="text-center w-1/2 mx-auto font-bold mb-5">
            Hill Cipher using Unimodular Matrix Key and Henon Map Chaos Function
          </p>

          <div
            className="flex flex-row justify-center items-center space-x-3"
            style={{ marginBottom: 20 }}
          >
            <Link
              className="border-b-4 duration-200 py-1 border-yellow-500"
              href="/"
            >
              Encrypt
            </Link>

            <Link
              className="border-b-4 border-white duration-200 py-1 hover:border-yellow-500"
              href="/decrypt"
            >
              Decrypt
            </Link>
          </div>

          <div className="flex items-center space-x-3 h-12">
            <input
              type="text"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="outline-none bg-gray-200 h-full px-4"
              placeholder="Passkey"
            />

            <button
              className="h-full bg-green-500 text-white px-3 hover:bg-green-700 duration-200"
              onClick={generateKey}
            >
              Generate Key
            </button>
          </div>

          {passkeyError && <p className="text-red-600">{passkeyError}</p>}

          <select
            className="self-start outline-none bg-gray-200 p-3 cursor-pointer"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="">Select Mode</option>
            <option value="write-text">Write Text</option>
            <option value="upload-file">Upload File</option>
          </select>

          {mode == "write-text" && (
            <textarea
              className=" bg-gray-200 p-3 px-4 outline-none w-full resize-none sm:w-96"
              rows="5"
              placeholder="Write here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
          )}

          {file && (
            <div className="bg-gray-200 p-3 px-4 flex flex-row items-center justify-between">
              <p>{file.name}</p>

              <XMarkIcon
                className="cursor-pointer h-6 w-6 text-red-600"
                onClick={() => setFile(null)}
              />
            </div>
          )}

          {mode == "upload-file" && (
            <div style={{ marginTop: 20 }}>
              <label
                htmlFor="file"
                className="bg-green-500 self-start p-3 px-4 text-white hover:bg-green-700 duration-200 cursor-pointer"
              >
                Choose a File
              </label>
              <input
                className="hidden"
                type="file"
                name="file"
                id="file"
                onChange={(e) => handleFileInput(e)}
              />
            </div>
          )}

          <p className="font-bold" style={{ marginTop: 50 }}>
            Recipient Credentials
          </p>

          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <div className="flex flex-col w-60">
              <input
                className="p-3 px-4 bg-gray-200 outline-none"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Recipient's Email"
              />

              {emailError && <p className="text-red-600">{emailError}</p>}
            </div>

            <div className="flex flex-col w-60">
              <input
                className="p-3 px-4 bg-gray-200 outline-none"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Recipient's Phone Number"
              />

              {phoneError && <p className="text-red-600">{phoneError}</p>}
            </div>
          </div>

          <button
            className="self-start p-3 px-4 bg-green-500 hover:bg-green-700 duration-200 text-white"
            onClick={handleSend}
          >
            Send
          </button>

          <div className="text-gray-600">
            <p>* Recipient will receive email of the ciphertext</p>
            <p>
              * Recipient will receive a passkey different from your passkey by
              sms
            </p>
          </div>

          {ciphertext && (
            <div className="space-y-3">
              <p className="font-bold">Ciphertext</p>

              <div className="bg-gray-200 p-3 px-4">
                <p>{ciphertext}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
