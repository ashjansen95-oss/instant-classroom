import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { resetStore } from './src/lib/storage/store'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  window.sessionStorage.clear()
  // The storage stores cache snapshots at module scope, so they have to be
  // emptied too or state leaks between tests.
  resetStore()
})

// jsdom implements neither of these; several components feature-detect them.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }))
}
