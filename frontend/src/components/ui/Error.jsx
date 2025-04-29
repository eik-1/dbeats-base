import React from "react"
import { useNavigate, useRouteError } from "react-router-dom"

const Error = () => {
    const error = useRouteError()
    const navigate = useNavigate()

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-4xl text-[#424242] mb-4">
                Oops! Something went wrong.
            </h1>
            <p className="text-xl text-[#808080] mb-8 px-8">
                {error.statusText ||
                    error.message ||
                    "An unexpected error occurred."}
            </p>
            <button
                className="btn btn-error hover:bg-opacity-90"
                onClick={() => navigate("/")}
            >
                Go to Home
            </button>
        </div>
    )
}

export default Error
