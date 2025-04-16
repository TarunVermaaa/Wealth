"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function HeroSection() {
  return (
    <div className="pb-20 px-4">
      <div className=" mx-auto font-bold container text-center" >
        <h1 className="text-5xl  md:text-8xl lg:[105px] pb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Manage Your Finances <br /> With Intelligence
        </h1>

        <p className="text-center text-gray-600 mt-4">
          An AI-Powered financial assistant that helps you manage your money,
          track your expenses, and achieve your financial goals.
        </p>

        <div>
          <Link href="/dashboard">
            <Button size={"lg"} className={"mx-170"}>
              Get Started
            </Button>
          </Link>

          <Link href="https://github.com/TarunVermaaa">
            <Button size={"lg"} className={"mx-170"}>
              Get Started
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <div>
          <Image
            src="/banner.jpeg"
            width={1280}
            height={720}
            alt="banner"
            className="rounded-lg shadow-2xl border mx-auto"
            priority
          />
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
