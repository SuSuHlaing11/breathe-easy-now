import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wind, User, ChevronDown, Save, History, Download, LogOut, Users, Settings } from "lucide-react";

interface HeaderProps {
  variant?: "landing" | "app";
  userRole?: "guest" | "user" | "admin";
}

const Header = ({ variant = "landing", userRole = "guest" }: HeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <header className="w-full bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground group-hover:bg-accent transition-colors">
            <Wind className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg text-foreground hidden sm:block">
            AirHealth Explorer
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          {variant === "landing" && (
            <>
              <a
                href="#about"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                About
              </a>
              <a
                href="#contact"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                Contact
              </a>
            </>
          )}

          {userRole === "guest" ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {userRole === "user" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/saved" className="flex items-center gap-2 cursor-pointer">
                        <Save className="h-4 w-4" />
                        Saved
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/history" className="flex items-center gap-2 cursor-pointer">
                        <History className="h-4 w-4" />
                        History
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/export" className="flex items-center gap-2 cursor-pointer">
                        <Download className="h-4 w-4" />
                        Export Data
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {userRole === "admin" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/users" className="flex items-center gap-2 cursor-pointer">
                        <Users className="h-4 w-4" />
                        User Management
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/history" className="flex items-center gap-2 cursor-pointer">
                        <History className="h-4 w-4" />
                        History
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 cursor-pointer text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
