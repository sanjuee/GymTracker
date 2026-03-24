const Footer = () => {
  return (
    <footer className="w-full pt-4 pb-8 mt-5 border-t border-zinc-900 flex flex-col items-center gap-3">
      <p className="text-zinc-500 text-sm font-outfit">
        Designed & Developed by <span className="text-accent">Sanju</span>
      </p>
      <div className="flex gap-6">
        <a href="https://github.com/sanjuee/GymTracker" 
           target="_blank" 
           className="text-zinc-400 hover:text-white transition-colors">
          GitHub
        </a>
      </div>
      <p className="text-zinc-600 text-xs uppercase tracking-widest font-semibold">
        © 2026 GymLog v1.0
      </p>
    </footer>
  )
}

export default Footer