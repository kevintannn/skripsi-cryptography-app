import NextHead from "@/components/NextHead";
import Link from "next/link";
import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { BASE_URL } from "@/config/constants";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import gradientBlue from "../public/assets/gradient-blue.jpg";

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
  const [modeError, setModeError] = useState(null);
  const [textError, setTextError] = useState(null);
  const [fileError, setFileError] = useState(null);
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
      .then(async (res) => {
        if (res.data.ciphertext) {
          setLoadingMessage(
            `Finish encrypting in ${res.data.encryption_time} seconds. Sending email...`,
          );
          setCiphertext(res.data.ciphertext);

          await axios
            .post(BASE_URL + "/send-email-with-attachment", {
              recipient_email: email,
              file_path: res.data.ciphertext_file_path,
              from: "text",
            })
            .then(async (res) => {
              if (res.data == "success") {
                setLoadingMessage(
                  "Email sent. Sending passkey to phone number...",
                );

                await axios
                  .post("/api/sendSMS", {
                    phone: phone,
                    body: "Your passkey: " + passkey,
                  })
                  .then((res) => {
                    if (res.data.success == true) {
                      setMessage(
                        "Encrypted file is sent to recipient's email and passkey is sent to recipient's phone number!",
                      );
                    } else {
                      setMessage(
                        "Failed. Something went wrong. Please try again.",
                      );
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                    setMessage(
                      "Failed. Something went wrong. Please try again.",
                    );
                  });
              } else {
                setMessage(
                  "Encrypted text is too big to be sent through gmail!",
                );
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });

    setLoading(false);
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
      .then(async (res) => {
        if (res.data.file_path) {
          setLoadingMessage(
            `Finish encrypting in ${res.data.encryption_time} seconds, sending email...`,
          );

          await axios
            .post(BASE_URL + "/send-email-with-attachment", {
              recipient_email: email,
              file_path: res.data.file_path,
              from: "file",
            })
            .then(async (res) => {
              if (res.data == "success") {
                await axios
                  .post("/api/sendSMS", {
                    phone: phone,
                    body: "Your passkey: " + passkey,
                  })
                  .then((res) => {
                    if (res.data.success) {
                      setMessage(
                        "Encrypted file is sent to recipient's email and passkey is sent to recipient's phone number!",
                      );
                    } else {
                      setMessage(
                        "Failed. Something went wrong. Please try again!",
                      );
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              } else {
                setMessage(
                  "Encrypted file is too big to be sent through gmail!",
                );
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });

    setLoading(false);
  };

  const isError = () => {
    if (passkey == "") {
      setPasskeyError("Passkey is required");
      return true;
    }

    if (mode == "") {
      setModeError("Select a mode");
      return true;
    } else if (mode == "write-text" && text == "") {
      setTextError("Write some text");
      return true;
    } else if (mode == "upload-file" && !file) {
      setFileError("Upload a file");
      return true;
    }

    if (email == "") {
      setEmailError("Email address is required");
      return true;
    }

    if (phone == "") {
      setPhoneError("Phone number is required");
      return true;
    } else if (!phone.startsWith("+62")) {
      setPhoneError("Must starts with +62");
      return true;
    } else if (phone.length < 11) {
      setPhoneError("Phone number is too short");
      return true;
    } else if (phone.length > 15) {
      setPhoneError("Invalid phone number");
      return true;
    }

    if (
      passkeyError ||
      modeError ||
      textError ||
      fileError ||
      emailError ||
      phoneError
    ) {
      return true;
    }

    return false;
  };

  const handleSend = async () => {
    if (isError()) {
      return;
    }

    if (mode == "write-text") {
      await axiosModeWriteText();
    } else if (mode == "upload-file") {
      await axiosModeUploadFile();
    }
  };

  const handleFileInput = (e) => {
    setFile(e.target.files[0]);
  };

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
    setPhoneError(null);
  }, [phone]);

  useEffect(() => {
    setEmailError(null);

    if (email != "") {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) == false) {
        setEmailError("Invalid email format");
      } else if (!email.endsWith("gmail.com")) {
        setEmailError("Email must be gmail");
      }
    }
  }, [email]);

  useEffect(() => {
    setFileError(null);
  }, [file]);

  useEffect(() => {
    setTextError(null);

    if (text != "" && text.length < 10) {
      setTextError("Min. 10 characters");
    }
  }, [text]);

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
    setText("");
    setFile(null);
    setCiphertext(null);
    setMessage(null);
    setModeError(null);
  }, [mode]);

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
        <div
          className="flex min-h-screen items-center justify-center"
          style={{
            backgroundImage: `url(${gradientBlue.src})`,
            backgroundSize: "cover",
          }}
        >
          <div className="bg-white p-10 w-[400px] rounded-lg my-10">
            {message && <Toast message={message} setMessage={setMessage} />}

            <p className="text-center text-2xl font-bold mb-3">
              Encrypted Data Sender
            </p>

            <div className="flex flex-row justify-center items-center gap-x-3 mb-5">
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

            <div
              className={`flex flex-row items-center h-12 gap-x-3 ${
                passkeyError ? "mb-1" : "mb-3"
              }`}
            >
              <div className="flex-1 h-full">
                <input
                  type="text"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  className="outline-none bg-gray-200 h-full px-4 w-full"
                  placeholder="Passkey"
                />
              </div>

              <button
                className="h-full bg-green-500 text-white px-3 hover:bg-green-700 duration-200"
                onClick={generateKey}
              >
                Generate Key
              </button>
            </div>

            {passkeyError && (
              <p className="text-red-600 mb-3">{passkeyError}</p>
            )}

            <div className="flex flex-row gap-x-3 mb-10">
              <div className="">
                <select
                  className="self-start outline-none bg-gray-200 p-3 cursor-pointer"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                >
                  <option value="">Select Mode</option>
                  <option value="write-text">Write Text</option>
                  <option value="upload-file">Upload File</option>
                </select>

                {modeError && <p className="text-red-600 mt-1">{modeError}</p>}
              </div>

              <div className="flex-1 w-full">
                {mode == "write-text" && (
                  <div className="w-full">
                    <textarea
                      className="bg-gray-200 p-3 px-4 outline-none w-full resize-none"
                      rows="5"
                      placeholder="Write here..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    ></textarea>

                    {textError && (
                      <p className="text-red-600 mt-1">{textError}</p>
                    )}
                  </div>
                )}

                {mode == "upload-file" && (
                  <div className="flex flex-col">
                    <div className="bg-gray-200 p-3 px-4 flex flex-row items-center justify-between mb-5">
                      <p className="break-all">
                        {file?.name || "Upload a file!"}
                      </p>

                      {file && (
                        <XMarkIcon
                          className="cursor-pointer h-6 w-6 text-red-600"
                          onClick={() => setFile(null)}
                        />
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="file"
                        className="bg-green-500 p-3 px-4 text-white hover:bg-green-700 duration-200 cursor-pointer"
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

                    {fileError && (
                      <p className="text-red-600 mt-3">{fileError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <p className="font-bold mb-3">Recipient's Information</p>

            <div className="flex flex-col w-full mb-5">
              <p className="text-sm mb-1">Email Address (Gmail)</p>

              <input
                className={`p-3 px-4 bg-gray-200 outline-none ${
                  emailError ? "mb-1" : "mb-3"
                }`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@gmail.com"
              />

              {emailError && <p className="text-red-600 mb-3">{emailError}</p>}

              <p className="text-sm mb-1">Phone Number</p>

              <input
                className={`p-3 px-4 bg-gray-200 outline-none ${
                  phoneError && "mb-1"
                }`}
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62"
              />

              {phoneError && <p className="text-red-600 mb-3">{phoneError}</p>}
            </div>

            <button
              className="self-start p-3 px-4 bg-green-500 hover:bg-green-700 duration-200 w-full text-white mb-3"
              onClick={handleSend}
            >
              Send
            </button>

            <div className="text-gray-600 mb-3">
              <p>* Recipient will receive email of the ciphertext</p>
              <p>* Recipient will receive a passkey by sms</p>
            </div>

            {ciphertext && (
              <div className="flex flex-col gap-y-3">
                <p className="font-bold">Encrypted Text</p>

                <div className="bg-gray-200 p-3 px-4">
                  <pre className="whitespace-pre-wrap break-all">
                    {ciphertext}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
