
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, LogOut, File, Menu, X } from "lucide-react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get user's name from metadata or use email as fallback
  const getUserName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    // Fallback to first part of email or generic "User"
    return user?.email?.split('@')[0] || "User";
  };

  // Get first character for the avatar
  const getInitial = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-primary">CloudDrop</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-primary transition-colors flex items-center"
              >
                <File className="mr-2 h-4 w-4" />
                My Files
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                      {getInitial()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                      {getInitial()}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getUserName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 pb-6">
              <div className="flex flex-col space-y-3">
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-primary transition-colors flex items-center px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <File className="mr-2 h-4 w-4" />
                  My Files
                </Link>
                
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                      {getInitial()}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{getUserName()}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start px-3 py-2 mt-2"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
};
