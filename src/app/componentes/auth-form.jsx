"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Instagram, Facebook } from "lucide-react"
import Image from "next/image"

import Navbar from "./navbar"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    usuario: "",
    contraseña: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(
        "https://voley-backend-nhyl.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      )

      const data = await response.json()

      if (data.success) {
        // Guardar id, rol y token en localStorage
        localStorage.setItem("idUser", data.data.id)
        localStorage.setItem("rol", data.data.rol)
        localStorage.setItem("token", data.data.token)

        // Redirigir a /inicio
        router.push("/jugadores")
      } else {
        setError(data.message || "Error al iniciar sesión")
      }
    } catch (error) {
      setError("Error de conexión. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900 font-sans">
      <Navbar />

      <div className="flex justify-center items-center flex-grow">
        <div className="grid gap-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-[26px] m-4">
            <div className="border-[20px] border-transparent rounded-[20px] dark:bg-gray-900 bg-white shadow-lg xl:p-10 2xl:p-10 lg:p-10 md:p-10 sm:p-2 m-2">
              {/* Logo y título */}
              <div className="flex flex-col items-center pt-8 pb-6">
                <Link
                  href="https://www.univalle.edu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-4 hover:scale-105 transition-transform duration-300"
                >
                  <Image
                    src="/logo.png"
                    alt="Logo Univalle"
                    width={100}
                    height={100}
                    priority
                  />
                </Link>
                <h1 className="font-bold dark:text-gray-400 text-5xl text-center cursor-default">
                  ReacVoley
                </h1>
              </div>

              {/* Formulario de login */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="usuario"
                    className="mb-2 dark:text-gray-400 text-lg block"
                  >
                    Usuario
                  </label>
                  <input
                    id="usuario"
                    name="usuario"
                    className="border p-3 dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 shadow-md placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={formData.usuario}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="contraseña"
                    className="mb-2 dark:text-gray-400 text-lg block"
                  >
                    Contraseña
                  </label>
                  <input
                    id="contraseña"
                    name="contraseña"
                    className="border p-3 shadow-md dark:bg-indigo-700 dark:text-gray-300 dark:border-gray-700 placeholder:text-base focus:scale-105 ease-in-out duration-300 border-gray-300 rounded-lg w-full"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={formData.contraseña}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <button
                  className="bg-gradient-to-r dark:text-gray-300 from-blue-500 to-purple-500 shadow-lg mt-6 p-2 text-white rounded-lg w-full hover:scale-105 hover:from-purple-500 hover:to-blue-500 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "INICIANDO SESIÓN..." : "INICIAR SESIÓN"}
                </button>
              </form>

              {/* Enlaces de redes sociales */}
              <div className="flex items-center justify-center mt-8 space-x-4">
                <Link
                  href="https://www.instagram.com/univalle_bolivia/?hl=es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-105 ease-in-out duration-300 shadow-lg p-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                >
                  <Instagram size={24} />
                </Link>

                <Link
                  href="https://www.facebook.com/UnivalleBolivia/?locale=es_LA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-105 ease-in-out duration-300 shadow-lg p-3 rounded-lg bg-blue-600 text-white"
                >
                  <Facebook size={24} />
                </Link>
                <Link
                  href="https://www.univalle.edu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:scale-105 ease-in-out duration-300 p-3 rounded-lg"
                >
                  <Image
                    src="/logo.png"
                    alt="Univalle Logo"
                    width={43}
                    height={43}
                    priority
                  />
                </Link>
              </div>

              {/* Términos y condiciones */}
              <div className="text-gray-500 flex text-center flex-col mt-6 items-center text-sm">
                <p className="cursor-default">
                  Bienvenido al sistema de entrenamiento para la selección de voley{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
