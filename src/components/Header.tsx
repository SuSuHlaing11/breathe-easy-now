import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wind, User, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  variant?: "landing" | "app";
  userRole?: "guest" | "user" | "admin";
}

const Header = ({ variant = "landing" }: HeaderProps) => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { isAuthenticated, role, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const displayName = user ? ((user as any).org_name || (user as any).name || "User") : "";

  return (
    <motion.header 
      className="w-full bg-card border-b border-border sticky top-0 z-50"
      initial={prefersReducedMotion ? {} : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div 
            className="p-2 rounded-lg bg-primary text-primary-foreground group-hover:bg-accent transition-colors"
            whileHover={prefersReducedMotion ? {} : { scale: 1.05, rotate: 5 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          >
            <Wind className="h-5 w-5" />
          </motion.div>
          <span className="font-semibold text-lg text-foreground hidden sm:block">
            AirHealth Explorer
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          {variant === "landing" && (
            <motion.div 
              className="hidden md:flex items-center gap-6"
              initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <motion.a
                href="#announcements"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                whileHover={prefersReducedMotion ? {} : { y: -2 }}
              >
                Announcements
              </motion.a>
              <motion.a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                whileHover={prefersReducedMotion ? {} : { y: -2 }}
              >
                Features
              </motion.a>
              <motion.a
                href="#register"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                whileHover={prefersReducedMotion ? {} : { y: -2 }}
              >
                Register
              </motion.a>
            </motion.div>
          )}

          {!isAuthenticated ? (
            <motion.div 
              className="flex items-center gap-2"
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <motion.div 
                      className="h-8 w-8 rounded-full bg-primary flex items-center justify-center"
                      whileHover={{ rotate: 10 }}
                    >
                      <User className="h-4 w-4 text-primary-foreground" />
                    </motion.div>
                    <span className="hidden sm:inline max-w-[120px] truncate">{displayName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link 
                    to={role === "admin" ? "/admin" : "/dashboard"} 
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
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
    </motion.header>
  );
};

export default Header;
