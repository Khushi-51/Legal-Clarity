import { Logo } from '@/components/icons';
import Link from 'next/link';
import { Button } from '../ui/button';
import { FilePlus2 } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card p-4 border-b sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-foreground">
            Legal Clarity India
          </h1>
        </Link>
        <div className="flex items-center gap-4">
            <Link href="/draft">
                <Button variant="outline">
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Draft a Contract
                </Button>
            </Link>
        </div>
      </div>
    </header>
  );
}
