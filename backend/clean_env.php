<?php
$content = file_get_contents('.env');
// Clean up corrupted UTF-16 characters and whitespace
$clean = preg_replace('/[^\x20-\x7E\r\n]/', '', $content);
// Remove the corrupted cloudinary line specifically
$lines = explode("\n", $clean);
$final = [];
foreach ($lines as $line) {
    if (!str_contains($line, 'CLOUDINARY_URL') && !str_contains($line, 'C L O U D')) {
        $final[] = $line;
    }
}
$final[] = 'CLOUDINARY_CLOUD_NAME=duzuan5nn';
$final[] = 'CLOUDINARY_API_KEY=563759941878522';
$final[] = 'CLOUDINARY_API_SECRET=EBUw4dkmGJ36T3JmuGjs7CIu0jU';
file_put_contents('.env', implode("\n", $final));
echo "Cleaned .env";
