# **App Name**: EduStream

## Core Features:

- Bottom Navigation: Implement a bottom navigation bar with Home, Batches, Notes, and Profile screens for easy navigation.
- Home Screen: Display available batches as cards with course details. Load batch details using provided JSON URL.
- Batch Details: Show subject details, including video links and notes. Subject details fetched from Google Drive JSON links.
- Video Playback: Play video content within the app using react-native-video, or open the video URL using the YouTube app when appropriate (AI tool).
- Notes Viewer: Open and view notes directly within the app using react-native-pdf.
- Theme Switching: Implement a theme toggle to switch between light and dark themes, persisting user preference using React Context.
- Profile Management: Provide a profile screen, including options to view/edit profile, toggle theme, and display the logged-in user's information.

## Style Guidelines:

- Primary color: #6C63FF (RGB hex value) – a vibrant violet to give a sense of digital learning and innovation
- Background color: #F5F5FA (RGB hex value) – a light, desaturated tint of the primary color, for a bright and clean feel.
- Accent color: #FF4081 (RGB hex value) – a bright pink, analogous to the primary, that contrasts with the background and gives a contemporary feel
- Font pairing: 'Poppins' (sans-serif) for headlines and short amounts of text, and 'PT Sans' (sans-serif) for body text
- Use react-native-vector-icons for consistent and scalable icons across the app. Icons should complement the theme (filled for primary, outlined for secondary).
- Employ a card-based layout with subtle shadows to create depth and visual hierarchy. Utilize white space effectively to prevent clutter.
- Incorporate subtle animations for screen transitions and interactive elements to enhance the user experience without being distracting.