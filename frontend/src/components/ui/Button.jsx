export default function Button({ children, handleClick }) {
    return (
        <button 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-emerald-500 text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-3xl" 
            onClick={handleClick}
        >
            {children}
        </button>
    )
}
