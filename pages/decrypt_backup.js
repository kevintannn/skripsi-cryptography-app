import LoadingSpinner from "@/components/LoadingSpinner";
import NextHead from "@/components/NextHead";
import { BASE_URL } from "@/config/constants";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Decrypt() {
  const [passkey, setPasskey] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [plaintext, setPlaintext] = useState(null);
  const [mode, setMode] = useState("");
  const [file, setFile] = useState(null);

  const [passkeyError, setPasskeyError] = useState(null);
  const [modeError, setModeError] = useState(null);
  const [ciphertextError, setCiphertextError] = useState(null);
  const [fileError, setFileError] = useState(null);

  const [loading, setLoading] = useState(false);

  const axiosModeWriteText = async () => {
    setLoading(true);

    await axios
      .post(BASE_URL + "/decrypt", {
        ciphertext: ciphertext,
        passkey: passkey,
      })
      .then((res) => {
        console.log(res.data);
        if (res.data) {
          setPlaintext(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setPasskey("");
        setCiphertext("");
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
        console.log(res.data);
        if (res.data) {
          const fileURL = URL.createObjectURL(new Blob([res.data]));
          const fileName = res.headers["x-file-name"];

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
        setPasskey("");
        setLoading(false);
      });
  };

  const handleDecrypt = async () => {
    if (passkey.length <= 0) {
      setPasskeyError("Please input passkey!");
      return;
    }

    if (mode == "") {
      setModeError("Please select mode!");
      return;
    }

    if (mode == "write-text") {
      if (ciphertext == "" || ciphertextError) {
        setCiphertextError("Please input encrypted text!");
        return;
      }

      await axiosModeWriteText();
    } else if (mode == "upload-file") {
      if (!file || fileError) {
        setFileError("Please choose file!");
        return;
      }

      await axiosModeUploadFile();
    }
  };

  const handleFileInput = (e) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    if (ciphertext != "") {
      setCiphertextError(null);
    }
  }, [ciphertext]);

  useEffect(() => {
    if (file) {
      setFileError(null);
    }
  }, [file]);

  useEffect(() => {
    if (passkey.length > 0) {
      setPasskeyError(null);
    }
  }, [passkey]);

  useEffect(() => {
    setCiphertext("");
    setFile(null);
    setModeError(null);
    setFileError(null);
    setCiphertextError(null);
    setPlaintext(null);
  }, [mode]);

  return (
    <>
      <NextHead title="Decrypt" />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="p-5 px-10 flex flex-col space-y-3">
          <p className="text-center w-1/2 mx-auto font-bold mb-5">
            Hill Cipher using Unimodular Matrix Key and Henon Map Chaos Function
          </p>

          <div
            className="flex flex-row justify-center items-center space-x-3"
            style={{ marginBottom: 20 }}
          >
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

          <input
            type="text"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            className="outline-none bg-gray-200 h-12 px-4 w-full sm:w-fit"
            placeholder="Passkey"
          />

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

          {modeError && <p className="text-red-600">{modeError}</p>}

          {mode == "write-text" && (
            <textarea
              className=" bg-gray-200 p-3 px-4 outline-none w-full resize-none sm:w-96"
              rows="5"
              placeholder="Paste encrypted text here..."
              value={ciphertext}
              onChange={(e) => setCiphertext(e.target.value)}
            ></textarea>
          )}

          {ciphertextError && <p className="text-red-600">{ciphertextError}</p>}

          {file && (
            <div
              className="bg-gray-200 p-3 px-4 flex flex-row items-center justify-between"
              style={{ marginBottom: 20 }}
            >
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

              {fileError && <p className="text-red-600 mt-5">{fileError}</p>}
            </div>
          )}

          <button
            className="self-start p-3 px-4 bg-green-500 hover:bg-green-700 duration-200 text-white"
            style={{ marginTop: 20 }}
            onClick={handleDecrypt}
          >
            Decrypt
          </button>

          {plaintext && (
            <>
              <p className="font-bold">Decrypted Text</p>
              <div className="p-3 px-4 bg-gray-200">
                <p>{plaintext}</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
