"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useRef } from "react";

function HeroSection() {
  const imageRef = useRef();

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);
    

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="pb-20 px-4">
      <div className=" mx-auto font-bold container text-center">
        <h1 className="text-5xl  md:text-8xl lg:[105px] pb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Manage Your Finances <br /> With Intelligence
        </h1>

        <p className="text-center text-gray-600 mb-8 max-w-2xl text-xl mx-auto">
          An AI-Powered financial assistant that helps you manage your money,
          track your expenses, and achieve your financial goals.
        </p>

        <div className="flex justify-center items-center space-x-4">
          <Link href="/dashboard">
            <Button size={"lg"}>Get Started</Button>
          </Link>

          <Link href="https://github.com/TarunVermaaa">
            <Button size={"lg"} variant={"outline"}>
              Watch Demo
            </Button>
          </Link>
        </div>
      </div>

      <div className="hero-image-wrapper">
        <div ref={imageRef} className="hero-image">
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
