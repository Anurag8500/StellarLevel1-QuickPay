"use client";

export function Footer() {
  return (
    <footer className="w-full py-6 px-6 border-t border-zinc-800">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="text-sm text-zinc-500">
            Built on Stellar Testnet
          </span>
        </div>

        <a
          href="https://stellar.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
        >
          stellar.org
        </a>
      </div>
    </footer>
  );
}
