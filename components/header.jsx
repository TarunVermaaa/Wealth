import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import WealthLogo from "@/public/Wealth1.png";
const header = async () => {

  await checkUser()



  return (
    <div className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b ">
      <nav className="container mx-auto px-4 flex items-center justify-between ">
        <Link href="/">
          <Image
            src={WealthLogo}
            width={200}
            height={200}
            className="h-25 object-contain w-auto"
          />
        </Link>

        <div className="flex items-center gap-2 space-x-4">
          <SignedIn>
            <Link
              href={"/dashboard"}
              className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
            >
              <Button variant={"outline"}>
                <LayoutDashboard size={16} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
          </SignedIn>

          <SignedIn>
            <Link
              href={"/transaction/create"}
              className="text-gray-600 hover:text-blue-600 flex items-center gap-2"
            >
              <Button>
                <PenBox size={16} />
                <span className="hidden md:inline">Add transaction</span>
              </Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignOutButton>
              <SignInButton forceRedirectUrl="/dashboard">
                <Button variant={"outline"} className=" ml-auto">
                  Login
                </Button>
              </SignInButton>
            </SignOutButton>
          </SignedOut>


          <SignInButton>
            <UserButton appearance={{
              elements: {
                avatarBox: {
                  width: '2rem',
                  height: '2rem'
                }
              }
            }} />
          </SignInButton>
        </div>
      </nav>
    </div>
  );
};

export default header;
