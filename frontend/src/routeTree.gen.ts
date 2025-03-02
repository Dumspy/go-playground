/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as AboutImport } from './routes/about'
import { Route as IndexImport } from './routes/index'
import { Route as BooksIndexImport } from './routes/books/index'
import { Route as AuthorsIndexImport } from './routes/authors/index'
import { Route as BooksBookIdImport } from './routes/books/$bookId'
import { Route as AuthorsAuthorIdImport } from './routes/authors/$authorId'
import { Route as AuthLoginImport } from './routes/auth/login'
import { Route as AdminDashboardImport } from './routes/admin/dashboard'

// Create/Update Routes

const AboutRoute = AboutImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const BooksIndexRoute = BooksIndexImport.update({
  id: '/books/',
  path: '/books/',
  getParentRoute: () => rootRoute,
} as any)

const AuthorsIndexRoute = AuthorsIndexImport.update({
  id: '/authors/',
  path: '/authors/',
  getParentRoute: () => rootRoute,
} as any)

const BooksBookIdRoute = BooksBookIdImport.update({
  id: '/books/$bookId',
  path: '/books/$bookId',
  getParentRoute: () => rootRoute,
} as any)

const AuthorsAuthorIdRoute = AuthorsAuthorIdImport.update({
  id: '/authors/$authorId',
  path: '/authors/$authorId',
  getParentRoute: () => rootRoute,
} as any)

const AuthLoginRoute = AuthLoginImport.update({
  id: '/auth/login',
  path: '/auth/login',
  getParentRoute: () => rootRoute,
} as any)

const AdminDashboardRoute = AdminDashboardImport.update({
  id: '/admin/dashboard',
  path: '/admin/dashboard',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/about': {
      id: '/about'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AboutImport
      parentRoute: typeof rootRoute
    }
    '/admin/dashboard': {
      id: '/admin/dashboard'
      path: '/admin/dashboard'
      fullPath: '/admin/dashboard'
      preLoaderRoute: typeof AdminDashboardImport
      parentRoute: typeof rootRoute
    }
    '/auth/login': {
      id: '/auth/login'
      path: '/auth/login'
      fullPath: '/auth/login'
      preLoaderRoute: typeof AuthLoginImport
      parentRoute: typeof rootRoute
    }
    '/authors/$authorId': {
      id: '/authors/$authorId'
      path: '/authors/$authorId'
      fullPath: '/authors/$authorId'
      preLoaderRoute: typeof AuthorsAuthorIdImport
      parentRoute: typeof rootRoute
    }
    '/books/$bookId': {
      id: '/books/$bookId'
      path: '/books/$bookId'
      fullPath: '/books/$bookId'
      preLoaderRoute: typeof BooksBookIdImport
      parentRoute: typeof rootRoute
    }
    '/authors/': {
      id: '/authors/'
      path: '/authors'
      fullPath: '/authors'
      preLoaderRoute: typeof AuthorsIndexImport
      parentRoute: typeof rootRoute
    }
    '/books/': {
      id: '/books/'
      path: '/books'
      fullPath: '/books'
      preLoaderRoute: typeof BooksIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/about': typeof AboutRoute
  '/admin/dashboard': typeof AdminDashboardRoute
  '/auth/login': typeof AuthLoginRoute
  '/authors/$authorId': typeof AuthorsAuthorIdRoute
  '/books/$bookId': typeof BooksBookIdRoute
  '/authors': typeof AuthorsIndexRoute
  '/books': typeof BooksIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/about': typeof AboutRoute
  '/admin/dashboard': typeof AdminDashboardRoute
  '/auth/login': typeof AuthLoginRoute
  '/authors/$authorId': typeof AuthorsAuthorIdRoute
  '/books/$bookId': typeof BooksBookIdRoute
  '/authors': typeof AuthorsIndexRoute
  '/books': typeof BooksIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/about': typeof AboutRoute
  '/admin/dashboard': typeof AdminDashboardRoute
  '/auth/login': typeof AuthLoginRoute
  '/authors/$authorId': typeof AuthorsAuthorIdRoute
  '/books/$bookId': typeof BooksBookIdRoute
  '/authors/': typeof AuthorsIndexRoute
  '/books/': typeof BooksIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/about'
    | '/admin/dashboard'
    | '/auth/login'
    | '/authors/$authorId'
    | '/books/$bookId'
    | '/authors'
    | '/books'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/about'
    | '/admin/dashboard'
    | '/auth/login'
    | '/authors/$authorId'
    | '/books/$bookId'
    | '/authors'
    | '/books'
  id:
    | '__root__'
    | '/'
    | '/about'
    | '/admin/dashboard'
    | '/auth/login'
    | '/authors/$authorId'
    | '/books/$bookId'
    | '/authors/'
    | '/books/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AboutRoute: typeof AboutRoute
  AdminDashboardRoute: typeof AdminDashboardRoute
  AuthLoginRoute: typeof AuthLoginRoute
  AuthorsAuthorIdRoute: typeof AuthorsAuthorIdRoute
  BooksBookIdRoute: typeof BooksBookIdRoute
  AuthorsIndexRoute: typeof AuthorsIndexRoute
  BooksIndexRoute: typeof BooksIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AboutRoute: AboutRoute,
  AdminDashboardRoute: AdminDashboardRoute,
  AuthLoginRoute: AuthLoginRoute,
  AuthorsAuthorIdRoute: AuthorsAuthorIdRoute,
  BooksBookIdRoute: BooksBookIdRoute,
  AuthorsIndexRoute: AuthorsIndexRoute,
  BooksIndexRoute: BooksIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/about",
        "/admin/dashboard",
        "/auth/login",
        "/authors/$authorId",
        "/books/$bookId",
        "/authors/",
        "/books/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/about": {
      "filePath": "about.tsx"
    },
    "/admin/dashboard": {
      "filePath": "admin/dashboard.tsx"
    },
    "/auth/login": {
      "filePath": "auth/login.tsx"
    },
    "/authors/$authorId": {
      "filePath": "authors/$authorId.tsx"
    },
    "/books/$bookId": {
      "filePath": "books/$bookId.tsx"
    },
    "/authors/": {
      "filePath": "authors/index.tsx"
    },
    "/books/": {
      "filePath": "books/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
