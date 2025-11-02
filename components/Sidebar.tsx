"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Home,
  BookOpen,
  Folder,
  LogOut,
  School,
  GraduationCap,
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`bg-gray-900 text-white p-4 h-screen transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white mb-6 focus:outline-none"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <nav className="space-y-2">
        <Link href="/" className="flex items-center gap-2 hover:text-gray-400">
          <Home size={20} />
          {isOpen && "Home"}
        </Link>

        <hr className="border-gray-700 my-2" />

        <Link
          href="/programs"
          className="flex items-center gap-2 hover:text-gray-400"
        >
          <BookOpen size={20} />
          {isOpen && "Programs"}
        </Link>

        <hr className="border-gray-700 my-2" />

        <Link
          href="/programs/categories"
          className="flex items-center gap-2 hover:text-gray-400"
        >
          <Folder size={20} />
          {isOpen && "Categories"}
        </Link>

        <hr className="border-gray-700 my-2" />

        <Link
          href="/schools"
          className="flex items-center gap-2 hover:text-gray-400"
        >
          <School size={20} />
          {isOpen && "Schools"}
        </Link>

        <hr className="border-gray-700 my-2" />

        <Link
          href="/universities"
          className="flex items-center gap-2 hover:text-gray-400"
        >
          <GraduationCap size={20} />
          {isOpen && "Universities"}
        </Link>

        <hr className="border-gray-700 my-2" />

        <Link
          href="/login"
          className="flex items-center gap-2 hover:text-gray-400"
        >
          <LogOut size={20} />
          {isOpen && "Logout"}
        </Link>
      </nav>
    </aside>
  );
}
