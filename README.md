Unsplash Image Discovery Engine
A high-performance, responsive image gallery application built with jQuery and the Unsplash API. This project demonstrates advanced front-end capabilities including infinite scrolling, state persistence, and dynamic content rendering.

Technical Features
1. Asynchronous Data Fetching
REST API Integration: Utilizes the Unsplash API to fetch high-resolution images based on user queries or curated editorial feeds.

Pagination Logic: Implements a page-tracking system to manage sequential data requests.

Search Optimization: Handles URI encoding for search queries to ensure robust API communication.

2. Infinite Scroll Architecture
Scroll Monitoring: Monitors the viewport position relative to the document height.

Performance Guarding: Uses a "loading" state flag to prevent redundant API calls and race conditions while fetching new data.

Buffer Strategy: Triggers data fetching before the user reaches the absolute bottom of the page (800px threshold) for a seamless experience.

3. State Management and Persistence
Favorites System: Implements a local storage-based persistence layer. Users can save images that remain available even after page reloads.

Real-time DOM Sync: Dynamically adds/removes items from the "Favorites" view while maintaining the active state of UI components (heart icons).

View Switching: Efficiently toggles between "Discovery" and "Favorites" modes by clearing and re-rendering the gallery container.

4. User Interface and Experience
Custom Lightbox: A built-in modal system for high-resolution image viewing, featuring event bubbling prevention and fade-in animations.

Responsive Grid: A sophisticated CSS layout using Flexbox and Media Queries that adjusts from 3 columns on desktop to a single-column layout on mobile devices.

Interactive Elements: CSS-driven hover effects and transitions that provide immediate visual feedback to user interactions.

Technical Stack
Logic: jQuery (JavaScript library)

Styling: CSS3 (Flexbox, Media Queries, CSS Variables)

API: Unsplash API (RESTful)

Persistence: Web Storage API (LocalStorage)

watch the gallery here [https://drive.google.com/file/d/101qthR-eZV3kU-JISb3MIONyVs6qJdoU/view?usp=sharing]
