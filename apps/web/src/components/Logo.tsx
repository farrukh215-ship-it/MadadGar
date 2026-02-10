import Image from 'next/image';
import Link from 'next/link';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  linked?: boolean;
  className?: string;
};

const sizes = { sm: 28, md: 36, lg: 44 };
const textSizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' };

export function Logo({ size = 'md', linked = true, className = '' }: LogoProps) {
  const s = sizes[size];
  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.png"
        alt="Madadgar"
        width={s}
        height={s}
        priority
        className="flex-shrink-0"
      />
      <span className={`font-bold text-brand-900 ${textSizes[size]}`}>
        Madadgar
      </span>
    </div>
  );
  if (linked) {
    return <Link href="/">{content}</Link>;
  }
  return content;
}
