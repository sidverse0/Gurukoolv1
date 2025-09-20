import type { SVGProps } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export const Icons = {
  Logo: (props: SVGProps<SVGSVGElement>) => (
    <div
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-full',
        props.className
      )}
      style={{
        boxShadow: '0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary))',
      }}
    >
      <Image
        src="https://files.catbox.moe/039z22.png"
        alt="GuruKool Logo"
        width={64}
        height={64}
        className="rounded-full"
      />
    </div>
  ),
};
