import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createSupabaseBrowserClient(
    "https://mmcraayrsuthxotbogqz.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3JhYXlyc3V0aHhvdGJvZ3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MzgwMzYsImV4cCI6MjA3NTIxNDAzNn0.yETHY_7SVixo4ebAvT0wxd0_nCwct7ps7byoXt_m5B4",
  )
}

export function createBrowserClient() {
  return createClient()
}
