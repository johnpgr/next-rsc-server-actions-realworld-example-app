
# ![RealWorld Example App](logo.png)

> ### Next.js codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.
## [Demo](https://next-13-rsc-realworld-example-app.vercel.app/) [RealWorld](https://github.com/gothinkster/realworld)

This codebase was created to demonstrate a fully fledged fullstack application built with **Next.js 13.4** Server actions & **React Server Components** including CRUD operations, authentication, routing, pagination, and more.

The fullstack experience in Next.js got improved with the experimental server actions. This is my first project built using it.

For obvious reasons I did not adhere to the official API specs, and this project has no exposed API endpoints due to the use of server actions to achieve all backend operations.

## Authentication
I used [Next-auth](https://next-auth.js.org/) with a single Credentials provider to achieve a great authentication experience, works great with Server components, unfortunately, it doesn't run on the Edge runtime yet.
- TODO: add maybe other auth providers

## Data Layer
For the data layer I'm using [Turso](https://turso.tech/) (SQLite) along with [Drizzle-orm](https://orm.drizzle.team/); Great developer experience and speed.

## UI
[Shadcn](https://ui.shadcn.com) beautifully styled components with [TailwindCSS](https://tailwindcss.com/) and great accessibility.
- TODO: remove unused components from the codebase
- TODO: add dark mode & improve colors

# How it works

> TODO

# Getting started

> TODO

## Features

> TODO

### General functionality:
- Authenticate users via JWT (login/signup pages + logout button on settings page)
- CRU- users (sign up & settings page - no deleting required)
- CRUD Articles
- CR-D Comments on articles (no updating required)
- GET and display paginated lists of articles
- Favorite articles
- Follow other users
