import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import appCss from '../styles.css?url'
import iconUrl from '../icon.png?no-inline'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'color-scheme', content: 'light dark' },
      { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#f2f2ef' },
      { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#08080c' },
      { title: 'Emoji autocomplete at the speed of typing' },
      { name: 'description', content: 'Type anything and the emoji lights up as you go. Every pause is one TypeSafe AI Jev call: hundreds of options, three typed answers, a few hundred milliseconds.' },
    ],
    scripts: [
      {
        children:
          "try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}",
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/png', sizes: '192x192', href: iconUrl },
      { rel: 'apple-touch-icon', href: iconUrl },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
