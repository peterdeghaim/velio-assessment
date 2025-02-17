"use client";

import { Input } from "@heroui/input";
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

function SearchBar() {
  const [searchInput, setSearchInput] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q')

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchInput.trim()) {
        router.push(`/?q=${encodeURIComponent(searchInput.trim())}`)
      } else {
        router.push('/')
      }
    }
  }

  return (
    <Input
      type="text"
      placeholder="Search videos..."
      className="w-full"
      size="lg"
      radius="full"
      variant="bordered"
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      onKeyDown={handleSearch}
    />
  )
}

export default function Navbar() {
  return (
    <nav className="w-full border-b border-zinc-800 bg-black">
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <Suspense fallback={
          <Input
            type="text"
            placeholder="Loading..."
            className="w-full"
            size="lg"
            radius="full"
            variant="bordered"
            disabled
          />
        }>
          <SearchBar />
        </Suspense>
      </div>
    </nav>
  )
}
