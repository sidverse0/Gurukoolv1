import type { SVGProps } from 'react';

export const Icons = {
  Logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
      className="h-6 w-6"
    >
      <path
        fill="currentColor"
        d="M240 128a15.77 15.77 0 0 1-10.5 14.94l-151 79.25A16 16 0 0 1 56 208V48a16 16 0 0 1 22.5-14.19l151 79.25A15.77 15.77 0 0 1 240 128Z"
      ></path>
    </svg>
  ),
};
