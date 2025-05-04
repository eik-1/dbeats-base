import * as React from "react"

function Input({ className, type, ...props }, ref) {
    return <input type={type} className={""} ref={ref} {...props} />
}

export { Input }
