#!/bin/bash
TARGET_DIR="./src/assets/videos"
OUTPUT_DIR="./src/assets/videos_compressed"
mkdir -p "$OUTPUT_DIR"

for file in "$TARGET_DIR"/*.mp4; do
    filename=$(basename "$file")
    echo "Compressing $filename..."
    ffmpeg -i "$file" -vf scale=-2:720 -vcodec libx264 -crf 24 -preset fast -y "$OUTPUT_DIR/$filename"
done

# Replace original files with compressed ones
mv "$OUTPUT_DIR"/*.mp4 "$TARGET_DIR"/
rmdir "$OUTPUT_DIR"
