import type { SVGProps } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export const Icons = {
  Logo: (props: SVGProps<SVGSVGElement>) => (
    <div
      className={cn(
        'relative flex h-8 w-8 items-center justify-center rounded-full',
        props.className
      )}
      style={{
        boxShadow: '0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary))',
      }}
    >
      <Image
        src="https://files.catbox.moe/039z22.png"
        alt="GuruKool Logo"
        width={32}
        height={32}
        className="rounded-full"
      />
    </div>
  ),
};
