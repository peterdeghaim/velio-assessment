"use client";

import { Card, CardBody } from "@heroui/card";
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// Initialize Supabase client
const supabase = createClient(
  'https://xfdeffmzmyopeldpmoob.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZGVmZm16bXlvcGVsZHBtb29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2ODY2OTUsImV4cCI6MjA1NTI2MjY5NX0.nW-rR74N48XAQQyvLIfdEs40PegPd2swh7ZSfE1bsNk'
);

interface Video {
  video_id: string
  thumbnail: string
  title: string
  views: number
  date_posted: string
  channel_custom_url: string
  channel?: {
    subscribers: number
    custom_url: string
  }
}

function VideoGrid() {
  const [videos, setVideos] = useState<Video[]>([])
  const searchParams = useSearchParams()
  const query = searchParams.get('q')

  useEffect(() => {
    async function fetchVideos() {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          channel: channels!inner(subscribers, custom_url)
        `)

      if (data) {
        const videosWithHQThumbnails = data.map(video => ({
          ...video,
          thumbnail: video.thumbnail.replace('/default.jpg', '/maxresdefault.jpg')
        }))

        if (query) {
          const filtered = videosWithHQThumbnails.filter(video =>
            video.title.toLowerCase().includes(query.toLowerCase()) ||
            video.channel?.custom_url.toLowerCase().includes(query.toLowerCase())
          )
          setVideos(filtered)
        } else {
          setVideos(videosWithHQThumbnails)
        }
      }
    }

    fetchVideos()
  }, [query])

  function formatViews(views: number): string {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInYears = now.getFullYear() - date.getFullYear()

    if (diffInYears > 0) {
      return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
    }

    const diffInMonths = now.getMonth() - date.getMonth()
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {videos.length > 0 ? (
        videos.map((video) => (
          <Card
            key={video.video_id}
            className="bg-zinc-900 border-none"
            radius="lg"
            isPressable
          >
            <CardBody className="p-0">
              {/* Thumbnail */}
              <div className="relative aspect-video rounded-t-xl overflow-hidden bg-zinc-800">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Video Details */}
              <div className="p-4">
                <h3 className="text-white font-semibold line-clamp-2 mb-2">
                  {video.title}
                </h3>
                <div className="text-sm text-zinc-400 space-y-1">
                  <div>
                    @{video.channel?.custom_url} • {formatViews(video.channel?.subscribers || 0)} subscribers
                  </div>
                  <div>
                    {formatViews(video.views)} views • {formatDate(video.date_posted)}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))
      ) : (
        <div className="col-span-full text-center text-zinc-400 py-8">
          No videos found
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <section className="min-h-screen bg-black p-4">
      <div className="max-w-screen-xl mx-auto">
        <Suspense fallback={<div>Loading videos...</div>}>
          <VideoGrid />
        </Suspense>
      </div>
    </section>
  )
}
