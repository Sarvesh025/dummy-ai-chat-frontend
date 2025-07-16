# Kuvaka Chat App

A modern chat application built with Next.js, React, and Tailwind CSS. Features include chatrooms, dashboard, login/OTP authentication, dark mode, toast notifications, and more.

---

## 📁 Folder & Component Structure

```
src/
  app/
    chatroom/
      [id]/
        layout.tsx      # Layout for individual chatroom pages
        page.tsx        # Chatroom page with messages, infinite scroll, etc.
    dashboard/
      page.tsx          # Dashboard listing all chatrooms, search, create/delete
    login/
      page.tsx          # Login/OTP authentication page
    layout.tsx          # Root layout, includes ToastContainer
    globals.css         # Global styles (Tailwind)
    page.tsx            # (Landing or main entry page)
  components/
    Header.tsx          # Shared header for dashboard/chatroom, theme-aware
    DarkModeToggle.tsx  # Dark/light mode toggle button
  context/
    ChatroomContext.tsx # React context for chatroom selection and typing state
  middleware.ts         # Next.js middleware for auth token checks
```

- **Pages** are organized by route in `src/app/`.
- **Components** are in `src/components/` and are shared across pages.
- **Context** provides global state for chatroom selection and typing status.

---

## ⚡ Throttling (Debounced Search)

- **Where:** `src/app/dashboard/page.tsx`
- **How:** The chatroom search input uses a debounced effect to avoid filtering on every keystroke. It waits 300ms after the user stops typing before updating the search results.
  ```js
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(searchValue);
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchValue]);
  ```
- **Why:** This improves performance and user experience by reducing unnecessary renders and filtering.

---

## 🔄 Pagination & Infinite Scroll

- **Where:** `src/app/chatroom/[id]/page.tsx`
- **How:** Messages are paginated using a `PAGE_SIZE` constant. On initial load, only the latest N messages are shown. A "Load older messages" button fetches the next page, simulating infinite scroll.
  ```js
  const PAGE_SIZE = 20;
  // On mount, load latest PAGE_SIZE messages
  // ...
  const loadOlder = () => {
    setLoadingOlder(true);
    setTimeout(() => {
      // Fetch more messages and prepend to the list
      setMessages(newMessages.slice(-totalLoaded));
      setPage(page + 1);
      setHasMore(newMessages.length > (page + 1) * PAGE_SIZE);
      setLoadingOlder(false);
      // Scroll to the first loaded message
      topRef.current?.scrollIntoView({ behavior: "auto" });
    }, 800);
  };
  ```
- **Why:** This keeps the chat performant and user-friendly, especially for long conversations.

---

## ✅ Form Validation

- **Where:** `src/app/login/page.tsx`
- **How:** Uses `react-hook-form` with `zod` schemas for robust validation of phone numbers and OTP codes.
  ```js
  const phoneSchema = z.object({
    country: z.string().min(1, "Select a country"),
    phone: z.string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must be at most 15 digits")
      .regex(/^\d+$/, "Phone number must contain only digits")
      .trim(),
  });
  // ...
  const phoneForm = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: { country: "", phone: "" },
  });
  ```
- **Why:** This ensures only valid data is accepted, providing instant feedback to users and preventing invalid submissions.

---

## 🌙 Other Notable Features

- **Dark Mode:** Toggleable via `DarkModeToggle.tsx`, using Tailwind’s `dark:` classes and storing preference in `localStorage`.
- **Toast Notifications:** All user feedback (errors, success, etc.) uses Toastify for a modern, theme-aware notification system.
- **Context Sharing:** `ChatroomContext` provides global state for selected chatroom and typing status, ensuring seamless navigation and UI updates.
- **Middleware:** Auth token checks are handled in `middleware.ts` to protect routes and redirect users as needed.

---

## Summary

This project is structured for clarity, scalability, and a great user experience. It leverages modern React/Next.js patterns, Tailwind CSS, and best practices for state management, validation, and UI feedback.
