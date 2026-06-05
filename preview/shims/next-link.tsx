import { AnchorHTMLAttributes, forwardRef, MouseEvent } from 'react';
import { navigate } from '../router';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

// Drop-in replacement for next/link backed by the hash router.
const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, onClick, children, ...rest },
  ref
) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    e.preventDefault();
    navigate(href);
  };
  return (
    <a ref={ref} href={`#${href}`} onClick={handle} {...rest}>
      {children}
    </a>
  );
});

export default Link;
