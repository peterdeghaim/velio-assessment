import os
from datetime import datetime
from typing import List
from googleapiclient.discovery import build
from supabase import create_client, Client

# YouTube API setup
YOUTUBE_API_KEY = 'AIzaSyAKGPyPmXiw9Oedub-OyYTF1OcQXa-INa4'
youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

# Supabase setup
SUPABASE_URL = 'https://xfdeffmzmyopeldpmoob.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZGVmZm16bXlvcGVsZHBtb29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2ODY2OTUsImV4cCI6MjA1NTI2MjY5NX0.nW-rR74N48XAQQyvLIfdEs40PegPd2swh7ZSfE1bsNk'
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_video_ids() -> List[str]:
    """Return list of video IDs to fetch."""
    return [
        "---AOnslvBo", "---Hnqef64k", "---JLbBz6Ls", "---KIj04zPQ", "---XjA38-uo",
        "---eDafFBhg", "---k1vFBbWw", "---kL8ZiM7g", "---n0WDScf8", "--01APk266U",
        "--02D71FV0g", "--0FinuLhug", "--0PHPuKyVU", "--0TYFEyz0c", "--0bCF-iK2E",
        "--0r21x1q1g", "--10rdVLy1U", "--11m37rCFQ", "--14w5SOEUs", "--1AXfq-Nl0",
        "--1GL5dLrYI", "--1IpIrEU1k", "--1PlF2VNP4", "--1eOrPughU", "--1kZDOLC9Q",
        "--1lSmtuyUg", "--1tPAtBOmM", "--1yBpF537M", "--28BBjBQLU", "--2N2QdRVs0",
        "--2SnbjKklM", "--2TdkJFZ2A", "--2VKlyOXGw", "--2YkuFG3b4", "--2eG2F7LHI",
        "--2oRD1ifBs", "--2pJasAQFY", "--2r8Pn0jT8", "--3-beh8d9Q", "--300uf82g",
        "--35JjRdKv8", "--3B0KgX-Ug", "--3Hn6OK9EE"
    ]

def get_channel_details(channel_id: str) -> dict:
    """Fetch channel details including custom URL."""
    try:
        channel_response = youtube.channels().list(
            part='snippet,statistics',
            id=channel_id
        ).execute()

        if channel_response.get('items'):
            channel = channel_response['items'][0]
            custom_url = channel['snippet'].get('customUrl', '')
            if custom_url:
                # Remove @ symbol if present and return
                return custom_url.lstrip('@')
            else:
                # Fallback to channel title if no custom URL
                return channel['snippet'].get('title', channel_id)
        return channel_id
    except Exception as e:
        print(f"Error fetching channel details: {e}")
        return channel_id

def get_video_details(video_ids: List[str]):
    """Fetch video details from YouTube API and store in Supabase."""
    # YouTube API only allows 50 videos per request
    for i in range(0, len(video_ids), 50):
        batch = video_ids[i:i + 50]
        
        try:
            # Get video details with proper ID format - no need to add prefix anymore
            print(f"Requesting videos: {batch}")
            
            response = youtube.videos().list(
                part='snippet,statistics',
                id=batch  # IDs already have proper prefix
            ).execute()

            print(f"Found {len(response.get('items', []))} videos in batch")
            
            # Process each video
            for video in response.get('items', []):
                try:
                    channel_id = video['snippet']['channelId']
                    
                    # Get channel details including subscriber count
                    channel_response = youtube.channels().list(
                        part='snippet,statistics',
                        id=[channel_id]
                    ).execute()
                    
                    channel = channel_response['items'][0]
                    subscriber_count = int(channel['statistics'].get('subscriberCount', 0))
                    
                    video_data = {
                        'video_id': video['id'],
                        'thumbnail': video['snippet']['thumbnails']['default']['url'],
                        'title': video['snippet']['title'],
                        'views': int(video['statistics']['viewCount']),
                        'date_posted': video['snippet']['publishedAt'],
                        'channel_custom_url': channel['snippet'].get('customUrl', '').lstrip('@') or channel_id
                    }

                    channel_data = {
                        'custom_url': video_data['channel_custom_url'],
                        'subscribers': subscriber_count,
                        'video_ids': [video['id']]
                    }

                    print(f"Video: {video_data['title']}, Channel: {channel_data['custom_url']}, Subs: {subscriber_count}")
                    
                    supabase.table('channels').upsert(channel_data).execute()
                    supabase.table('videos').insert(video_data).execute()

                except Exception as e:
                    print(f"Error processing video {video['id']}: {e}")

        except Exception as e:
            print(f"Error processing batch: {e}")

def main():
    """Main function to run the script."""
    video_ids = get_video_ids()
    get_video_details(video_ids)

if __name__ == "__main__":
    main()
