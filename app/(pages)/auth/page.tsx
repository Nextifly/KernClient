'use client'

import Logo from '@/app/assets/logo.png'
import axios from 'axios'
import { Lock, LogIn, User } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast' // Импорт toast

export default function AuthPage() {
	const [login, setLogin] = useState<string>('')
	const [password, setPassword] = useState<string>('')

	const router = useRouter()

	const handleAuth = async (e: FormEvent) => {
		e.preventDefault() // Предотвращаем перезагрузку страницы

		// 1. Проверка на пустые поля
		if (!login.trim() || !password.trim()) {
			toast.error('Введите логин / пароль')
			return
		}

		try {
			// 2. Запрос на сервер
			const data = { login: login, password: password }
			console.log(data)
			const response = await axios.post(
				'http://72.56.233.251:4200/user/get-user',
				data,
				{
					headers: {
						'Content-Type': 'application/json',
					},
				},
			)

			// 3. Обработка ответа
			if (response.status === 200) {
				toast.success('Вход выполнен успешно!')
				localStorage.setItem('token', response.data.access_token)
				router.push('/kern')
			} else {
				toast.error('Логин / пароль не верный')
			}
		} catch (error) {
			// Обработка сетевой ошибки (если сервер выключен)
			toast.error('Ошибка соединения с сервером')
			console.error(error)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center font-sans bg-gray-100'>
			{/* Добавляем контейнер для toast-уведомлений */}
			<Toaster position='top-center' />

			<div className='flex w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden min-h-[500px]'>
				{/* Левая панель */}
				<div className='hidden md:flex md:w-1/3 bg-[#003366] flex-col items-center py-12 px-6 text-white'>
					<div className='mb-8 text-center'>
						<div className='w-24 h-24 border-2 border-white/50 rounded-full flex items-center justify-center mb-4 mx-auto p-2'>
							<Image
								src={Logo}
								alt='Логотип'
								className='brightness-0 invert opacity-90'
							/>
						</div>
						<h2 className='text-sm font-bold uppercase tracking-wider leading-tight'>
							Kanyish Satbayev
						</h2>
						<p className='text-[10px] opacity-70 mt-1 uppercase'>
							Institute of Geological Sciences
						</p>
					</div>

					<div className='mt-auto text-[10px] opacity-40 text-center'>
						© 1940 — 2026 <br /> Цифровой Керн
					</div>
				</div>

				{/* Правая часть с формой */}
				<div className='w-full md:w-2/3 p-12 flex flex-col justify-center bg-white'>
					<div className='mb-10 text-center md:text-left'>
						<h1 className='text-2xl font-bold text-gray-800 mb-2'>
							Авторизация
						</h1>
						<p className='text-gray-500 text-sm'>
							Введите ваши данные для доступа к системе
						</p>
					</div>

					<form className='space-y-6' onSubmit={handleAuth}>
						<div>
							<label className='block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2'>
								Логин / Email
							</label>
							<div className='relative'>
								<span className='absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400'>
									<User size={18} />
								</span>
								<input
									type='text'
									className='w-full pl-10 pr-4 py-3 border-b-2 border-gray-200 focus:outline-none focus:border-[#003366] transition-colors bg-transparent text-gray-800'
									placeholder='admin'
									value={login}
									onChange={e => setLogin(e.target.value)}
								/>
							</div>
						</div>

						<div>
							<label className='block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2'>
								Пароль
							</label>
							<div className='relative'>
								<span className='absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400'>
									<Lock size={18} />
								</span>
								<input
									type='password'
									className='w-full pl-10 pr-4 py-3 border-b-2 border-gray-200 focus:outline-none focus:border-[#003366] transition-colors bg-transparent text-gray-800'
									placeholder='••••••••'
									value={password}
									onChange={e => setPassword(e.target.value)}
								/>
							</div>
						</div>

						<button
							type='submit'
							className='w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-4 rounded-md shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer mt-10'
						>
							<LogIn size={20} />
							ВОЙТИ В СИСТЕМУ
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}
