export default defineAppConfig({
  // https://nuxt.com/docs/api/configuration/nuxt-config
  ui: {
    primary: 'emerald',
    gray: 'slate',
    notifications: {
      // Show toasts at the top right by default
      position: 'top-right'
    },
    card: {
      base: 'overflow-hidden',
      rounded: 'rounded-lg',
      body: {
        padding: 'p-4 sm:p-5'
      },
      header: {
        padding: 'p-4 sm:p-5'
      },
      footer: {
        padding: 'p-4 sm:p-5'
      }
    },
    button: {
      rounded: 'rounded-lg',
      default: {
        size: 'md',
        color: 'primary'
      },
      defaultVariants: {
        // Set default button color to neutral
        // color: 'neutral'
      }
    },
    input: {
      default: {
        size: 'md'
      },
      rounded: 'rounded-lg'
    },
    select: {
      default: {
        size: 'md'
      },
      rounded: 'rounded-lg'
    },
    modal: {
      container: 'flex min-h-full items-center justify-center text-center',
      width: 'sm:max-w-lg'
    },
    table: {
      th: {
        base: 'text-left rtl:text-right'
      }
    }
  }
})
