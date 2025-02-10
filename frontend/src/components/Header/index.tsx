"use client";
import { useState } from "react";
import {
   Navbar,
   NavbarBrand,
   NavbarContent,
   NavbarItem,
   NavbarMenuToggle,
   NavbarMenu,
   NavbarMenuItem,
} from "@heroui/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export const AcmeLogo = () => {
   return (
      <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
         <path
            clipRule="evenodd"
            d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
            fill="currentColor"
            fillRule="evenodd"
         />
      </svg>
   );
};

export default function Header() {
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const pathname = usePathname();

   const menuItems = ["Home", "Create Model"];

   const links = [
      { title: "Home", href: "/" },
      { title: "Create Model", href: "/new/model" },
   ];

   return (
      <Navbar onMenuOpenChange={setIsMenuOpen} maxWidth="full">
         <NavbarContent>
            <NavbarMenuToggle
               aria-label={isMenuOpen ? "Close menu" : "Open menu"}
               className="sm:hidden"
            />
            <NavbarBrand>
               <AcmeLogo />
               <p className="font-bold text-inherit">ACME</p>
            </NavbarBrand>
         </NavbarContent>

         <NavbarContent className="hidden sm:flex gap-6">
            {links.map((item) => (
               <NavbarItem key={item.href}>
                  <Link
                     color={pathname === item.href ? "primary" : "foreground"}
                     className=""
                     href={item.href}
                  >
                     {item.title}
                  </Link>
               </NavbarItem>
            ))}
         </NavbarContent>

         <NavbarMenu>
            {menuItems.map((item, index) => (
               <NavbarMenuItem key={`${item}-${index}`}>
                  <Link
                     className="w-full"
                     color={
                        index === 2
                           ? "primary"
                           : index === menuItems.length - 1
                           ? "danger"
                           : "foreground"
                     }
                     href="#"
                     size="lg"
                  >
                     {item}
                  </Link>
               </NavbarMenuItem>
            ))}
         </NavbarMenu>
      </Navbar>
   );
}
