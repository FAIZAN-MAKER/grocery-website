"use client";

import { signOut } from "next-auth/react";
import {
  Package,
  Search,
  ShoppingCart,
  UserIcon,
  X,
  LogOut,
  ChevronDown,
  ShoppingBasket,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "admin" | "user" | "deliveryBoy";
  image?: string;
}

interface MenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  href?: string;
  icon?: React.ReactNode;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

// ─── Components ───────────────────────────────────────────────────────────────
const MenuItem = ({ children, onClick, className = "", href, icon }: MenuItemProps) => {
  const content = (
    <motion.div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-sm font-medium transition-colors ${className}`}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon && <span className="opacity-70">{icon}</span>}
      {children}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick}>
        {content}
      </Link>
    );
  }
  return <div onClick={onClick}>{content}</div>;
};

const Avatar = ({
  user,
  size = "md"
}: {
  user: IUser;
  size?: "sm" | "md" | "lg"
}) => {
  const initials = useMemo(() => {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user.name]);

  const sizeClasses = {
    sm: "w-7 h-7 text-xs rounded-lg",
    md: "w-9 h-9 text-sm rounded-xl",
    lg: "w-11 h-11 text-base rounded-2xl",
  };

  if (user.image) {
    return (
      <Image
        src={user.image}
        alt={user.name}
        width={size === "sm" ? 28 : size === "md" ? 36 : 44}
        height={size === "sm" ? 28 : size === "md" ? 36 : 44}
        className={`${sizeClasses[size]} object-cover`}
        priority={size === "lg"}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} bg-white/30 flex items-center justify-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Nav = ({ user }: { user: IUser }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Debounced search for API calls
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    // Trigger search API here with debouncedSearch
    console.log("Searching for:", debouncedSearch);
  }, [debouncedSearch]);

  useClickOutside(dropdownRef, () => setDropdownOpen(false));

  // Focus search when opened
  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setSearchOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignOut = useCallback(() => {
    setDropdownOpen(false);
    signOut({ callbackUrl: "/login" });
  }, []);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => !prev);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    searchRef.current?.focus();
  }, []);

  const firstName = useMemo(() => user.name.split(" ")[0], [user.name]);

  const springTransition = useMemo(() => ({
    type: "spring" as const,
    stiffness: shouldReduceMotion ? 300 : 120,
    damping: shouldReduceMotion ? 30 : 18,
  }), [shouldReduceMotion]);

  return (
    <motion.nav
      className="sticky top-0 z-50 w-full will-change-transform"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={springTransition}
      role="banner"
    >
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-900/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">

          {/* Logo - FIXED: Removed letterSpacing animation, using scale instead */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="SnapCart Home"
          >
            <motion.div
              className="w-10 h-10 bg-white/95 rounded-xl flex items-center justify-center shadow-sm ring-2 ring-white/20"
              whileHover={{ rotate: -12, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <ShoppingBasket className="w-5 h-5 text-green-600" />
            </motion.div>
            {/* FIXED: Removed problematic letterSpacing animation */}
            <span className="text-white font-bold text-xl tracking-tight hidden sm:block group-hover:tracking-wider transition-all duration-300 ease-out">
              SnapCart
            </span>
          </Link>

          {/* Desktop Search */}
          <motion.form
            className="hidden md:flex flex-1 max-w-lg items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 focus-within:bg-white/20 focus-within:border-white/40 transition-all duration-200"
            onSubmit={(e) => {
              e.preventDefault();
              console.log("Search submitted:", searchQuery);
            }}
            whileFocus={{ scale: 1.02 }}
            role="search"
          >
            <Search className="w-4 h-4 text-white/70 shrink-0" aria-hidden="true" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search groceries... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white placeholder:text-white/50 text-sm min-w-0"
              aria-label="Search groceries"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  type="button"
                  onClick={clearSearch}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.form>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Mobile search toggle */}
            <motion.button
              className="md:hidden w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
              onClick={toggleSearch}
              whileTap={{ scale: 0.9 }}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {searchOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="search"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Search className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Cart */}
            <Link href="/cart" aria-label="Shopping cart">
              <motion.div
                className="relative flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <ShoppingCart className="w-5 h-5" />
                <motion.span
                  className="absolute -top-1.5 -right-1.5 bg-white text-emerald-600 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, delay: 0.3 }}
                >
                  0
                </motion.span>
              </motion.div>
            </Link>

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 rounded-xl px-2.5 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                onClick={toggleDropdown}
                whileTap={{ scale: 0.97 }}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <Avatar user={user} size="sm" />
                <span className="text-white text-sm font-medium hidden sm:block max-w-[100px] truncate">
                  {firstName}
                </span>
                <motion.div
                  animate={{ rotate: dropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-white/70"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-100 overflow-hidden z-50 origin-top-right"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    role="menu"
                  >
                    {/* User info header */}
                    <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-br from-green-50 to-emerald-50/50">
                      <div className="flex items-center gap-3">
                        <Avatar user={user} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex mt-3 text-[10px] font-semibold uppercase tracking-wider bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                        {user.role === "deliveryBoy" ? "Delivery Partner" : user.role}
                      </span>
                    </div>

                    {/* Menu items */}
                    <div className="p-2 space-y-0.5">
                      <MenuItem
                        href="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        icon={<Package className="w-4 h-4" />}
                      >
                        My Orders
                      </MenuItem>

                      <MenuItem
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        icon={<UserIcon className="w-4 h-4" />}
                      >
                        Profile
                      </MenuItem>

                      <div className="h-px bg-gray-100 my-2" />

                      <MenuItem
                        onClick={handleSignOut}
                        className="text-red-600 hover:bg-red-50"
                        icon={<LogOut className="w-4 h-4" />}
                      >
                        Sign Out
                      </MenuItem>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className="md:hidden px-4 pb-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <form
                className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log("Mobile search:", searchQuery);
                }}
                role="search"
              >
                <Search className="w-5 h-5 text-white/70 shrink-0" aria-hidden="true" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search groceries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white placeholder:text-white/50 text-base min-w-0"
                  aria-label="Search groceries"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      type="button"
                      onClick={clearSearch}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Nav;
