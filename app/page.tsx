'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const page = () => {
  const route = useRouter()
  useEffect(() => {
    if (!localStorage.getItem("token")) route.push("/auth")
  },[])

  return (
    <div>
      Hello world!
    </div>
  )
}

export default page