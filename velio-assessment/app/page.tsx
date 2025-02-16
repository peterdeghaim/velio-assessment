"use client";

import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody } from "@heroui/card";
import { createClient } from '@supabase/supabase-js';

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fetch function for the API
const fetchApiData = async () => {
  const response = await fetch('https://velio-assessment-api.vercel.app/api');
  return response.text();
};

export default function Home() {
  // Query hook
  const { data, isLoading, isError } = useQuery({
    queryKey: ['apiData'],
    queryFn: fetchApiData,
  });

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">

      {/* API Data Display */}
      <Card className="max-w-xl w-full">
        <CardBody>
          {isLoading ? (
            <p>Loading...</p>
          ) : isError ? (
            <p>Error fetching data</p>
          ) : (
            <p>{data}</p>
          )}
        </CardBody>
      </Card>
    </section>
  );
}
