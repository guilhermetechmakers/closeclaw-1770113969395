import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, HelpCircle, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogoutConfirmationDialog } from '@/components/auth/logout-confirmation-dialog';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

interface TopNavProps {
  className?: string;
}

export function TopNav({ className }: TopNavProps) {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogoutConfirm = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
    setLogoutOpen(false);
    navigate('/', { replace: true });
  };

  return (
    <>
      <header
        className={cn(
          'flex h-14 items-center gap-4 border-b border-border bg-card px-4',
          className
        )}
      >
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 rounded-md border-border"
              aria-label="Search"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/help" aria-label="Help">
              <HelpCircle className="h-4 w-4" />
            </Link>
          </Button>
          {!isLoading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full transition-all hover:scale-[1.02]" aria-label="Account menu">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user_metadata?.avatar_url as string | undefined} alt={user.email ?? 'User'} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-md border-border bg-card shadow-lg">
                  <DropdownMenuLabel>
                    <span className="font-normal text-muted-foreground">{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => {
                      e.preventDefault();
                      setLogoutOpen(true);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" aria-hidden />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </div>
            )
          )}
        </div>
      </header>
      <LogoutConfirmationDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogoutConfirm}
        isConfirming={isSigningOut}
      />
    </>
  );
}
