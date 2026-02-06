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
import { Wind, User, ChevronDown, Save, History, Download, LogOut, Users } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface HeaderProps {
  variant?: "landing" | "app";
  userRole?: "guest" | "user" | "admin";
}

const Header = ({ variant = "landing", userRole = "guest" }: HeaderProps) => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const handleLogout = () => {
    navigate("/");
  };

  const MotionLink = prefersReducedMotion ? Link : motion(Link);

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
              className="flex items-center gap-6"
              initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <motion.a
                href="#about"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                whileHover={prefersReducedMotion ? {} : { y: -2 }}
              >
                About
              </motion.a>
              <motion.a
                href="#contact"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                whileHover={prefersReducedMotion ? {} : { y: -2 }}
              >
                Contact
              </motion.a>
            </motion.div>
          )}

          {userRole === "guest" ? (
            <motion.div 
              className="flex items-center gap-2"
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/signin">Sign In</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign Up</Link>
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
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </motion.div>
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
    </motion.header>
  );
};

export default Header;
