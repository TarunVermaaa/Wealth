import HeroSection from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mt-40">
      <HeroSection />

      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="  grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center p-4">
                <div className="text-3xl font-bold text-blue-600 mb-2 ">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage your finances.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((features, index) => {
              return (
                <Card key={index} className="p-6">
                  <CardContent className="space-y-4 pt-4">
                    {features.icon}
                    <h3 className="text-xl font-semibold">{features.title}</h3>
                    <p className="text-gray-600">{features.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 ">
            How it Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksData.map((work, index) => {
              return (
                <div key={index}>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    {work.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-center mb-2">
                    {work.title}
                  </h3>
                  <p className="text-gray-600 text-center">
                    {work.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            What our users are saying
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map((testimonial, index) => {
              return (
                <Card key={index} className="p-6">
                  <CardContent className="space-y-4 pt-4">
                    <div className="flex items-center mb-4">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={60}
                        height={60}
                        className="rounded-full"
                      />
                      <div className="ml-4" >
                        <div className="text-lg font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                    <p className="text-gray-600">{testimonial.quote}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

    <section className="py-20 bg-blue-500 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to take control of your finances?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of users who are already managing their money smarter with Wealth..
        </p>
        <Link href="/dashboard">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 animate-bounce">
            Get Started for Free
          </Button>
        </Link>
      </div>
    </section>









    </div>
  );
}
