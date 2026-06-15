/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mastermind game colors - 8 distinct colors for the game
        'game-red': '#EF4444',
        'game-blue': '#3B82F6',
        'game-green': '#10B981',
        'game-yellow': '#F59E0B',
        'game-purple': '#8B5CF6',
        'game-orange': '#F97316',
        'game-pink': '#EC4899',
        'game-brown': '#A16207',

        // UI colors for consistent theming
        'primary': '#1F2937',
        'secondary': '#6B7280',
        'accent': '#3B82F6',
        'success': '#10B981',
        'warning': '#F59E0B',
        'error': '#EF4444',

        // Additional grays for better UI consistency
        'gray-50': '#F9FAFB',
        'gray-100': '#F3F4F6',
        'gray-200': '#E5E7EB',
        'gray-300': '#D1D5DB',
        'gray-400': '#9CA3AF',
        'gray-500': '#6B7280',
        'gray-600': '#4B5563',
        'gray-700': '#374151',
        'gray-800': '#1F2937',
        'gray-900': '#111827',
      },

      // Custom spacing for game elements
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },

      // Custom border radius for game elements
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },

      // Custom shadows for depth
      boxShadow: {
        'game': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'game-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}