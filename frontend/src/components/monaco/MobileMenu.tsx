import React from 'react';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface MobileMenuProps {
  children: React.ReactNode;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ children }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="md:hidden bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="bg-slate-900 border-slate-800 text-white w-[300px] sm:w-[350px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-white">Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-3 mt-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};
