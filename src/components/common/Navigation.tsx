import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Search, Menu, X, Terminal, ChevronDown, User, LogOut, Plus, LayoutDashboard, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/templates?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Explore', href: '/templates' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <Shield className="h-7 w-7 text-primary" />
              <div className="absolute inset-0 animate-pulse-glow opacity-50" />
            </div>
            <span className="font-mono font-bold text-lg">
              <span className="text-gradient-primary">Commands</span>
              <span className="text-muted-foreground text-sm ml-1 hidden sm:inline">-HUB</span>
            </span>
          </Link>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payloads, tools, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border focus:border-primary/50 font-mono text-sm"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map(link => (
              <Link key={link.href} to={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={location.pathname === link.href ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
                >
                  {link.label}
                </Button>
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link to="/templates/create">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono">
                    <Plus className="h-4 w-4 mr-1" />
                    Create
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <span className="text-primary text-xs font-mono font-bold">
                          {user?.username?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-mono">{user?.username}</span>
                      {user?.role === 'admin' && (
                        <Badge className="bg-warning/20 text-warning border-warning/30 text-xs py-0">admin</Badge>
                      )}
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/templates/my-templates" className="flex items-center gap-2 cursor-pointer">
                        <BookMarked className="h-4 w-4" /> My Templates
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                          <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer flex items-center gap-2">
                      <LogOut className="h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-mono">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-primary text-primary-foreground font-mono">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-border space-y-3 animate-fade-in">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payloads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary border-border font-mono text-sm"
                />
              </div>
            </form>

            <div className="flex flex-col gap-1">
              <Link to="/templates" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Explore Templates</Button>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/templates/create" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Create Template</Button>
                  </Link>
                  <Link to="/templates/my-templates" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">My Templates</Button>
                  </Link>
                  <Link to="/profile" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Profile</Button>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">Admin</Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive"
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Login</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-primary text-primary-foreground">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
