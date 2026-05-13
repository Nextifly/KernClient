'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import Logo from '@/app/assets/logo.png'
import NumberIcon from '@/app/assets/number.png'
import MainIcon from '@/app/assets/main.png'
import CalcIcon from '@/app/assets/calc.png'
import ExitIcon from '@/app/assets/exit.png'

const Sidebar = () => {
	const pathname = usePathname()

	// Функция для проверки активной ссылки
	const isActive = (path: string) => '/' + pathname.split('/')[1] == path

	const navLinks = [
		{ name: 'Главная', href: '/', icon: MainIcon },
		{ name: 'Цифровой Керн', href: '/kern', icon: NumberIcon },
		{ name: 'Цифровое моделирование ПСВ', href: '/experiment', icon: CalcIcon },
		{ name: 'Выход', href: '/exit', icon: ExitIcon },
	]

	const route = useRouter()

	const handleExit = () => {
		localStorage.removeItem('token')
		route.push('/auth')
	}

	return (
		<aside className='w-72 h-screen bg-[#012C61] p-4 fixed flex flex-col shadow-xl'>
			{/* Логотип */}
			<div className='mb-8'>
				<Link href='/'>
					<Image
						src={Logo}
						alt='logo'
						className='w-full h-auto object-contain'
					/>
				</Link>
			</div>

			{/* Меню */}
			<ul className='flex flex-col gap-2'>
				{navLinks.map(link => {
					const active = isActive(link.href)

					// Если это кнопка выхода
					if (link.name === 'Выход') {
						return (
							<li key='exit-button'>
								<button
									onClick={handleExit} // Вызов функции выхода
									className='w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold uppercase text-sm tracking-wide text-white/80 hover:bg-red-500/20 hover:text-white cursor-pointer'
								>
									<Image src={link.icon} alt={link.name} className='size-6' />
									ВЫХОД
								</button>
							</li>
						)
					}

					// Для всех остальных обычных ссылок
					return (
						<li key={link.href}>
							<Link
								href={link.href}
								className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold uppercase text-sm tracking-wide
            ${
							active
								? 'bg-white/20 text-white shadow-md'
								: 'text-white/80 hover:bg-white/10 hover:text-white'
						}`}
							>
								<Image src={link.icon} alt={link.name} className='size-6' />
								{link.name}
							</Link>
						</li>
					)
				})}
			</ul>
		</aside>
	)
}

export default Sidebar
