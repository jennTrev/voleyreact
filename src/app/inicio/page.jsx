"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../componentes/navbar"

const API_URL = "https://jenn.onrender.com"

export default function Inicio() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId")

      if (!userId) {
        router.push("/")
        return
      }

      try {
        const response = await fetch(`${API_URL}/usuarios/${userId}`)

        if (!response.ok) {
          throw new Error("No se pudo obtener la información del usuario")
        }

        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("userId")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-medium text-gray-800">Cargando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md">
          <p className="text-red-500 mb-4 font-medium">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded hover:bg-[#2D4BA0] transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="container mx-auto p-4 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            Bienvenido, {user?.nombre} {user?.apellido}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#F0F4FF] p-4 rounded border border-[#D0D8F0]">
              <h2 className="text-lg font-semibold mb-2 text-[#1E3A8A]">Información del usuario</h2>

              <div className="space-y-2 text-gray-700">
                <p className="flex">
                  <span className="font-medium text-gray-900 w-40">Usuario:</span>
                  <span>{user?.user}</span>
                </p>
                <p className="flex">
                  <span className="font-medium text-gray-900 w-40">Correo:</span>
                  <span>{user?.correo}</span>
                </p>
                <p className="flex">
                  <span className="font-medium text-gray-900 w-40">Rol:</span>
                  <span className="capitalize">{user?.rol}</span>
                </p>

                {user?.rol === "jugador" && (
                  <>
                    <p className="flex">
                      <span className="font-medium text-gray-900 w-40">Altura:</span>
                      <span>{user?.altura} m</span>
                    </p>
                    <p className="flex">
                      <span className="font-medium text-gray-900 w-40">Posición:</span>
                      <span className="capitalize">{user?.posicion}</span>
                    </p>
                    <p className="flex">
                      <span className="font-medium text-gray-900 w-40">Fecha de nacimiento:</span>
                      <span>{new Date(user?.fecha_nacimiento).toLocaleDateString()}</span>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded hover:bg-[#2D4BA0] transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}

