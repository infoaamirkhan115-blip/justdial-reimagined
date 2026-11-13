# Justdial Redesign — Complete Plan

## 1. Business model
Justdial is India's largest local search engine (~17 crore users, 4 crore+ listings, 11,000+ cities).
- Users (free): search for local businesses and services, compare ratings/reviews/photos, then Call, WhatsApp, Chat or "Get Best Price" (lead).
- Businesses (paying customers): free basic listing, then paid plans for higher rank, "Verified"/"Trust" badges, sponsored slots and a steady flow of leads.
- Extra verticals: B2B/wholesale marketplace, bookings (doctors, hotels, movies, flights, bus), bill payments/recharge, quotes for home services, Jd Mart.
- Design goals: make finding something take one search; make listings look trustworthy so businesses see value; put lead buttons (Call / Enquire / Best Price) everywhere; get more businesses to sign up.

## 2. Problems with the current site (what we fix)
- Too crowded: banners, pop-ups, a dense icon wall and ads competing with search.
- Weak hierarchy: search doesn't feel central, categories are hard to scan.
- Listing cards are noisy with inconsistent badges; it's hard to compare.
- Little reason given to businesses to pay; free listing is buried.
- Mobile experience feels like a shrunken desktop.

## 3. Visual direction
- Mood: warm, confident, modern Indian, useful before flashy.
- Colors: deep ink navy (text/header), marigold saffron (main action), cream paper background, leaf green (Open now / Verified), soft coral for offers. Light theme first, dark mode tokens included.
- Fonts: Bricolage Grotesque (headings), Manrope (body).
- Style: big rounded search, 16–24px rounded cards, soft shadows, subtle grain texture, line icons (lucide), lots of space, fast hover/press feedback.
- Accessibility: AA contrast, keyboard focus rings, 44px tap targets, alt text everywhere.

## 4. Shared layout (every page)
- Top bar: logo, city picker (Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad + "detect my location"), compact search (appears after scrolling on home), links: Leads, Advertise, Free Listing, Login button, language switch (EN/हिं).
- Mobile: bottom tab bar (Home, Search, B2B, Bookings, Account).
- Footer: about, quick links, popular categories, popular cities, "for business" links, app download badges, social icons, copyright.

## 5. Pages

### 5.1 Home (/)
1. Hero: headline "Find anything near you, in seconds", big search with city + "what are you looking for" + voice icon, live suggestions, trending chips (Restaurants, AC Repair, Dentists, Packers & Movers, PG, Gyms).
2. Quick action tiles: B2B, Doctors, Hotels, Repairs, Bills & Recharge, Movies, Travel.
3. Category grid: 16 popular categories with icons + "All categories" link.
4. "Popular near you" scroll rows: Top restaurants, Top doctors, Home services — business cards with photo, rating, area, Open badge.
5. Bills & recharge strip: Mobile, Electricity, DTH, Gas, FASTag.
6. B2B / wholesale band: top product categories and "Post your requirement" form.
7. Trust numbers: users, listings, cities, reviews.
8. Recent reviews from users.
9. "Grow your business" banner with Free Listing button.
10. App download section with phone mockup.

### 5.2 Search results (/search?q=&city=)
- Breadcrumb + result count + query.
- Sticky filter bar: Sort (Relevance, Rating, Distance, Popular), Rating 4+, Open now, Verified, Top rated, Price range, Distance, category-specific filters.
- Listing cards: photo, name, Verified/Trust badges, rating badge + review count, area & distance, years in business, tags, highlight line, actions: Call, WhatsApp, Enquire / Get Best Price, "Sponsored" label on paid listings.
- Right side (desktop): map preview + "Get quotes from top 5" lead form.
- Empty and loading states.

### 5.3 Category page (/category/$slug)
- Header with category name and count in the chosen city, subcategory chips, popular areas, top listings, FAQs about the category, related categories.

### 5.4 Business detail (/business/$id)
- Photo gallery, name, rating summary, badges, address, timings with open/closed state, phone.
- Action row: Call, WhatsApp, Directions, Share, Save, Write review.
- Tabs: Overview, Services/Menu with prices, Photos, Reviews (rating breakdown bars + review list), Q&A.
- Sticky side card: "Get best price" enquiry form.
- Similar businesses nearby; "Is this your business? Claim it" link.

### 5.5 All categories (/categories)
- Searchable A–Z list grouped by theme (Food, Health, Home services, Education, Auto, Travel, Shopping, B2B).

### 5.6 B2B marketplace (/b2b)
- Product category tiles, featured suppliers, "Post buy requirement" form, how it works.

### 5.7 Free listing / For business (/free-listing)
- Value pitch ("Get customers who are already searching"), stats, 3-step how it works, plan comparison (Free / Premium / Platinum with features like ranking boost, verified badge, lead credits), testimonials from merchants, FAQ, signup form (business name, phone, city, category).

### 5.8 Advertise (/advertise)
- Ad formats (sponsored listing, banner, category ownership), audience stats, contact form.

### 5.9 Login (/login)
- Phone number + OTP style screen (visual only, no real login).

### 5.10 About (/about) and 404 page restyled.

## 6. Content and data
- Realistic sample data: ~40 businesses across 8 categories and 8 cities, with ratings, reviews, timings, services and prices; 30+ categories; trending searches.
- Forms (enquiry, listing, requirement, login) show a success message only; nothing is saved.
- Generated images: hero illustration, category photos, business photos, phone mockup.

## 7. Out of scope (can be added later)
- Real accounts, saved listings, real reviews, real leads delivered to businesses, payments, live maps. These would need Lovable Cloud.

## Technical details
- TanStack file routes for each page above; search params validated on /search; each route gets its own head() title/description/og tags; root title updated.
- Design tokens (oklch) in src/styles.css; fonts via link in __root; shared Header/Footer/MobileNav in __root around Outlet; sonner Toaster mounted.
- Mock data in src/data/*.ts with lookup helpers; reusable components: SearchBar, CategoryTile, BusinessCard, RatingBadge, FilterBar, EnquiryForm, SectionHeader.
- Images generated into src/assets.
