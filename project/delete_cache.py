import os
os.environ['GEMINI_API_KEY'] = 'AIzaSyAQRK98O2VIy6_RiDxTKB4IOo-UvDJkI7o'

import google.generativeai as genai
genai.configure(api_key=os.environ['GEMINI_API_KEY'])

print("🗑️  Listing and deleting ALL caches...\n")

# List all caches (no filtering)
all_caches = list(genai.caching.CachedContent.list())

if len(all_caches) == 0:
    print("ℹ️  No caches found.")
else:
    for i, cache in enumerate(all_caches, 1):
        print(f"\n{i}. Cache: {cache.name}")
        print(f"   Display name: {cache.display_name}")
        print(f"   Expires: {cache.expire_time}")
        try:
            cache.delete()
            print(f"   ✅ Deleted!")
        except Exception as e:
            print(f"   ❌ Error deleting: {e}")

print(f"\n✅ Deleted {len(all_caches)} cache(s)")
