import React from "react";

const Toast = ({ message, setMessage }) => {
  return (
    <div
      id="toast-success"
      className="flex items-center absolute right-5 w-full max-w-xs p-4 rounded-lg shadow text-gray-400 bg-gray-800"
      role="alert"
    >
      {/* <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8  rounded-lg bg-green-800 text-green-200">
        <svg
          aria-hidden="true"
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          ></path>
        </svg>
        <span className="sr-only">Check icon</span>
      </div> */}

      <p className="text-sm font-normal text-white">{message}</p>

      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5  rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5  inline-flex h-8 w-8 text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700"
        data-dismiss-target="#toast-success"
        aria-label="Close"
        onClick={() => setMessage(null)}
      >
        <span className="sr-only">Close</span>
        <svg
          aria-hidden="true"
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
    </div>
  );
};

export default Toast;
