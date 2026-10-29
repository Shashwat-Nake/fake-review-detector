import Image from "next/image"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative h-12 w-12">
        <Image src="/images/fake-stamp-logo.png" alt="Fake Review Detector Logo" fill className="object-contain" />
      </div>
      <div className="font-heading text-2xl tracking-wider">
        <span className="text-red-600">FAKE REVIEW</span>
        <br />
        <span className="text-slate-700 dark:text-slate-200">DETECTOR</span>
      </div>
    </div>
  )
}
