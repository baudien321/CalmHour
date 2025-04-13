import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white/5 dark:bg-zinc-900/5 backdrop-blur-lg border-t border-zinc-200/50 dark:border-zinc-800/50 w-full py-8">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          {/* Placeholder for logo - Consider adding Clock icon or similar */}
          {/* <Clock className="h-6 w-6 text-purple-600" /> */}
          <span className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            CalmHour
          </span>
        </div>
        <nav className="flex flex-wrap justify-center gap-4 md:gap-6 mb-4 md:mb-0">
          <Link
            href="#features"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            prefetch={false}
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            prefetch={false}
          >
            How It Works
          </Link>
          <Link
            href="#testimonials"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            prefetch={false}
          >
            Testimonials
          </Link>
          {/* Consider adding Pricing/Dashboard links here later */}
          {/*
          <Link
            href="/pricing"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            prefetch={false}
          >
            Pricing
          </Link>
          <Link
            href="/dashboard" // Assuming login takes user here
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            prefetch={false}
          >
            App Login
          </Link>
          */}
        </nav>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} CalmHour. All rights reserved.
        </div>
      </div>
      {/* Optional: Add social links or other footer content here */}
      {/*
      <div className="container mx-auto px-4 md:px-6 mt-6 flex justify-center gap-4">
        <Link href="#" aria-label="Twitter" prefetch={false}>
          <TwitterIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors" />
        </Link>
        <Link href="#" aria-label="LinkedIn" prefetch={false}>
          <LinkedinIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors" />
        </Link>
      </div>
      */}
    </footer>
  )
}

// Placeholder for icons if you add them
// function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.9 3.3 4.9s-1.6-.8-3.1-.8c-.1 0-.1 0-.2 0s-1.6.8-3.1.8c-1.1 0-2.1-.5-2.8-.8C7.4 11.1 4 10.8 4 10.8s4.6-7.2 14-7.2c0 0 1.6-.8 3.1-.8" />
//       <path d="M9 17c-1.1 0-2.1-.5-2.8-.8c-1.6-.8-3.1-.8-3.1-.8s.7 2.1 2 3.4c-.1 0-.1 0-.2 0s-1.6.8-3.1.8c-1.1 0-2.1-.5-2.8-.8c-1.6-.8-3.1-.8-3.1-.8s.7 2.1 2 3.4c.7.9 1.7 1.4 2.8 1.4c1.1 0 2.1-.5 2.8-.8c1.6-.8 3.1-.8 3.1-.8s-.7-2.1-2-3.4c.1 0 .1 0 .2 0s1.6-.8 3.1-.8c1.1 0 2.1.5 2.8.8c1.6.8 3.1.8 3.1.8s-.7-2.1-2-3.4c-.7-.9-1.7-1.4-2.8-1.4Z" />
//     </svg>
//   )
// }

// function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
//       <rect width="4" height="12" x="2" y="9" />
//       <circle cx="4" cy="4" r="2" />
//     </svg>
//   )
// }

