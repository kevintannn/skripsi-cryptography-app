import LoadingSpinner from "@/components/LoadingSpinner";
import NextHead from "@/components/NextHead";
import { BASE_URL } from "@/config/constants";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import gradientBlue from "../public/assets/gradient-blue.jpg";
import Toast from "@/components/Toast";

export default function Decrypt() {
  const [passkey, setPasskey] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [plaintext, setPlaintext] = useState(null);
  const [mode, setMode] = useState("");
  const [file, setFile] = useState(null);
  const [fileURL, setFileURL] = useState("#");
  const [fileName, setFileName] = useState("");

  const [passkeyError, setPasskeyError] = useState(null);
  const [modeError, setModeError] = useState(null);
  const [ciphertextError, setCiphertextError] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [fileDecryptSuccess, setFileDecryptSuccess] = useState(null);
  const [textDecryptSuccess, setTextDecryptSuccess] = useState(null);
  const [message, setMessage] = useState(null);

  const [loading, setLoading] = useState(false);

  const axiosModeWriteText = async () => {
    setLoading(true);

    await axios
      .post(BASE_URL + "/decrypt", {
        ciphertext: ciphertext,
        passkey: passkey,
      })
      .then((res) => {
        if (res.data) {
          setPlaintext(res.data.plaintext);
          setTextDecryptSuccess(
            `Text decrypted in ${res.data.decryption_time} seconds.`,
          );
          setMessage("Information decrypted!");
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setCiphertextError(null);
        setLoading(false);
      });
  };

  const axiosModeUploadFile = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append("passkey", passkey);
    formData.append("file", file);

    await axios
      .post(BASE_URL + "/decrypt-file", formData, {
        responseType: "blob",
      })
      .then((res) => {
        if (res.data) {
          const fileURL = URL.createObjectURL(new Blob([res.data]));
          const fileName = res.headers["x-file-name"];

          setFileURL(fileURL);
          setFileName(fileName);
          setFileDecryptSuccess(
            `File decrypted in ${res.headers["x-decryption-time"]} seconds. Decrypted file will be downloaded automatically.`,
          );
          setMessage("Information decrypted!");

          const link = document.createElement("a");
          link.href = fileURL;
          link.download = fileName;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setFile(null);
        setFileError(null);
        setLoading(false);
      });
  };

  const isError = () => {
    if (passkey == "") {
      setPasskeyError("Passkey is required");
      return true;
    }

    if (mode == "") {
      setModeError("Select a mode");
      return true;
    } else if (mode == "write-text" && ciphertext == "") {
      setCiphertextError("Please paste your encrypted text");
      return true;
    } else if (mode == "upload-file" && !file) {
      setFileError("Upload your encrypted file");
      return true;
    }

    if (passkeyError || modeError || ciphertextError || fileError) {
      return true;
    }

    return false;
  };

  const handleDecrypt = async () => {
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

  useEffect(() => {
    setFileError(null);
  }, [file]);

  useEffect(() => {
    setCiphertextError(null);
    setFileDecryptSuccess(null);
    setTextDecryptSuccess(null);
  }, [ciphertext]);

  useEffect(() => {
    setPasskeyError(null);

    if (passkey != "" && passkey.length != 10) {
      setPasskeyError("Passkey has to be 10 characters");
    }
  }, [passkey]);

  useEffect(() => {
    setModeError(null);
    setCiphertext("");
    setFile(null);
    setPlaintext(null);
    setFileDecryptSuccess(null);
    setTextDecryptSuccess(null);
  }, [mode]);

  return (
    <>
      <NextHead title="Decrypt" />

      {loading ? (
        <LoadingSpinner />
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
                className="border-b-4 duration-200 py-1 border-white hover:border-yellow-500"
                href="/"
              >
                Encrypt
              </Link>

              <Link
                className="border-b-4 duration-200 py-1 border-yellow-500"
                href="/decrypt"
              >
                Decrypt
              </Link>
            </div>

            <div className="w-full mb-3">
              <input
                type="text"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                className="outline-none bg-gray-200 h-12 px-4 w-full mb-1"
                placeholder="Passkey"
              />

              {passkeyError && <p className="text-red-600">{passkeyError}</p>}
            </div>

            <div className="w-full mb-3">
              <select
                className="self-start outline-none w-full bg-gray-200 p-3 cursor-pointer mb-1"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="">Select Mode</option>
                <option value="write-text">Write Text</option>
                <option value="upload-file">Upload File</option>
              </select>

              {modeError && <p className="text-red-600">{modeError}</p>}
            </div>

            {mode == "write-text" && (
              <div className="w-full mb-3">
                <textarea
                  className="bg-gray-200 p-3 px-4 mb-1 outline-none w-full resize-none"
                  rows="5"
                  placeholder="Paste encrypted text here..."
                  value={ciphertext}
                  onChange={(e) => setCiphertext(e.target.value)}
                ></textarea>

                {ciphertextError && (
                  <p className="text-red-600">{ciphertextError}</p>
                )}
              </div>
            )}

            {mode == "upload-file" && (
              <div className="mb-5">
                <div className="bg-gray-200 p-3 px-4 flex flex-row items-center justify-between mb-5">
                  <p className="break-all">
                    {file?.name || "Upload encrypted file!"}
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

                  {fileError && (
                    <p className="text-red-600 mt-3">{fileError}</p>
                  )}
                </div>
              </div>
            )}

            <button
              className="w-full p-3 px-4 mb-5 bg-green-500 hover:bg-green-700 duration-200 text-white"
              onClick={handleDecrypt}
            >
              Decrypt
            </button>

            {fileDecryptSuccess && (
              <div>
                <p className="mb-2">{fileDecryptSuccess}</p>

                <a
                  href={fileURL}
                  className="underline text-blue-600"
                  download={fileName}
                >
                  Click here if file does not download automatically
                </a>
              </div>
            )}
            {textDecryptSuccess && <p className="mb-5">{textDecryptSuccess}</p>}

            {plaintext && (
              <>
                <p className="font-bold mb-1">Decrypted Text</p>

                <div className="p-3 px-4 bg-gray-200">
                  <pre className="whitespace-pre-wrap break-all">
                    {plaintext}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
