import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Sidebar from './components/Sidebar'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Цифровой Керн',
	description: 'Цифровой Керн',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang='en'
			className={`${geistSans.variable} ${geistMono.variable} antialiased p-0  m-0`}
		>
			<body className='flex h-screen'>
				<Sidebar />
				<div className='bg-gray-100 ml-72 w-full'>{children}</div>
			</body>
		</html>
	)
}