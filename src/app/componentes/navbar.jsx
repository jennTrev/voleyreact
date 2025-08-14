"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Bell, ChevronDown, ArrowLeft, Facebook, Instagram, Twitter, MessageCircle, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [userInfo, setUserInfo] = useState({ rol: "", idUser: "", token: "" })

  useEffect(() => {
    const rol = localStorage.getItem("rol") || ""
    const idUser = localStorage.getItem("idUser") || ""
    const token = localStorage.getItem("token") || ""
    setUserInfo({ rol, idUser, token })
  }, [])

  const handleLogout = async () => {
    const token = localStorage.getItem("token")
    try {
      await fetch("https://voley-backend-nhyl.onrender.com/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      localStorage.clear()
      router.push("/")
    }
  }

  // Mostrar Navbar público si no hay datos de usuario
  if (!userInfo.rol || !userInfo.idUser || !userInfo.token) {
    return (
      <header className="relative z-10 px-6 py-4 bg-white shadow-sm border-b border-gray-200">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-[#800020] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">UV</span>
            </div>
            <span className="text-[#800020] font-bold text-xl">Voley</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-[#800020] hover:text-[#a64d66] font-medium">Inicio</Link>
            <Link href="/sobre-nosotros" className="text-gray-700 hover:text-[#800020]">Sobre Nosotros</Link>
            <Link href="/horarios-entrenamiento" className="text-gray-700 hover:text-[#800020]">Horarios</Link>
            <Link href="/logros" className="text-gray-700 hover:text-[#800020]">Logros</Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-[#800020] flex items-center">
                Categorías
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link href="/categorias/varones" className="block px-4 py-2 hover:bg-[#800020] hover:text-white">Varones</Link>
                <Link href="/categorias/damas" className="block px-4 py-2 hover:bg-[#800020] hover:text-white">Damas</Link>
              </div>
            </div>
            <Link href="/campeonatos" className="text-gray-700 hover:text-[#800020]">Campeonatos</Link>
            <Link href="/contacto" className="text-gray-700 hover:text-[#800020]">Contacto</Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <Facebook className="w-5 h-5 text-gray-600 hover:text-[#800020]" />
              <Instagram className="w-5 h-5 text-gray-600 hover:text-[#800020]" />
              <Twitter className="w-5 h-5 text-gray-600 hover:text-[#800020]" />
              <MessageCircle className="w-5 h-5 text-gray-600 hover:text-[#800020]" />
              <Youtube className="w-5 h-5 text-gray-600 hover:text-[#800020]" />
            </div>
            <Button asChild className="bg-[#800020] hover:bg-[#a64d66] text-white">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </nav>
      </header>
    )
  }

  // Navbar para usuario logueado
  if (pathname === "/login") {
    return (
      <header className="flex h-14 items-center gap-2 border-b border-gray-300 bg-white px-4 shadow-lg">
        <Link
          href="/"
          className="flex items-center gap-2 p-2 rounded-lg text-[#800020] hover:bg-[#800020] hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden sm:inline">Volver</span>
        </Link>
        <div className="flex items-center space-x-3 mx-auto">
          <div className="w-8 h-8 bg-[#800020] rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-white rounded"></div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-[#800020] font-bold text-lg">Univalle</h1>
            <p className="text-[#a64d66] text-xs">Volleyball System</p>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="flex h-14 items-center gap-2 border-b border-gray-300 bg-white px-4 shadow-lg">
      <SidebarTrigger className="-ml-1 text-[#800020] hover:bg-[#800020] hover:text-white" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex items-center space-x-3 cursor-default">
        <div className="w-8 h-8 bg-[#800020] rounded-lg flex items-center justify-center">
          <div className="w-5 h-5 bg-white rounded"></div>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-[#800020] font-bold text-lg">Univalle</h1>
          <p className="text-[#a64d66] text-xs">Volleyball System</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 ml-auto">
        <button className="p-2 rounded-lg text-[#800020] hover:bg-[#800020] hover:text-white relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#800020] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">{userInfo.rol.charAt(0).toUpperCase()}</span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-[#800020] capitalize">{userInfo.rol}</p>
            <p className="text-xs text-[#a64d66]">ID: {userInfo.idUser}</p>
          </div>
          <ChevronDown className="h-4 w-4 ml-1 text-[#800020]" />
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-sm rounded-lg text-[#800020] hover:bg-[#800020] hover:text-white"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  )
}
