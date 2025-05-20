"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

// URL de la API
const API_URL = "https://jenn.onrender.com"

export default function AuthForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Estado del formulario de inicio de sesión
  const [loginData, setLoginData] = useState({
    user: "",
    password: "",
  })

  // Manejar cambios en el formulario de inicio de sesión
  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData({
      ...loginData,
      [name]: value,
    })
  }

  // Manejar envío del formulario de inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          user: loginData.user,
          password: loginData.password,
        }),
      })

      // Verificar si la respuesta es correcta antes de intentar analizar JSON
      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al iniciar sesión")
        } else {
          // Si no es JSON, obtener texto y lanzar error
          const errorText = await response.text()
          console.error("Respuesta del servidor:", errorText)
          throw new Error("Error de conexión con el servidor")
        }
      }

      // Intentar analizar la respuesta JSON
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error("Error al analizar JSON:", parseError)
        throw new Error("Error al procesar la respuesta del servidor")
      }

      // Almacenar ID de usuario en localStorage
      localStorage.setItem("userId", data.userId)

      // Obtener información del usuario para guardar el rol
      try {
        const userResponse = await fetch(`${API_URL}/usuarios/${data.userId}`, {
          headers: {
            Accept: "application/json",
          },
        })

        if (!userResponse.ok) {
          throw new Error("No se pudo obtener información del usuario")
        }

        const userData = await userResponse.json()

        // Guardar el rol del usuario en localStorage
        localStorage.setItem("userRole", userData.rol)

        // Redireccionar según el rol del usuario
        router.push("/inicio")
      } catch (roleError) {
        console.error("Error al obtener el rol del usuario:", roleError)
        // Redirección predeterminada si falla la verificación del rol
        router.push("/inicio")
      }
    } catch (error) {
      console.error("Error de inicio de sesión:", error)
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('https://i.pinimg.com/736x/4d/73/66/4d7366202d6511525a11b1615c5151ff.jpg')" }}
    >
      <div className="w-[300px] h-[500px] bg-black/70 overflow-hidden relative shadow-lg">
        {/* Encabezado */}
        <div className="w-full bg-black/10">
          <h1 className="text-center py-2.5 font-light text-xl text-white/50">Iniciar Sesión</h1>
        </div>

        {/* Logo */}
        <div className="relative mx-auto bg-center bg-no-repeat bg-cover transition-all duration-200 ease-in-out flex items-center justify-center w-[150px] h-[150px] mt-[30px]">
          <div className="text-white text-4xl font-bold">ReactVolt</div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="absolute top-[180px] left-0 right-0 mx-auto text-center px-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Formulario de login */}
        <div className="absolute bottom-[50px] w-full">
          <form className="w-full" onSubmit={handleLogin}>
            <input
              type="text"
              name="user"
              placeholder="Usuario"
              value={loginData.user}
              onChange={handleLoginChange}
              className="block w-[84%] mx-auto my-5 p-2.5 bg-transparent border-l-[5px] border-l-[#1E3A8A] text-white font-light text-lg transition-all duration-200 focus:outline-none focus:bg-[#1E3A8A]/20 focus:rounded-[20px] focus:border-transparent"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={loginData.password}
              onChange={handleLoginChange}
              className="block w-[84%] mx-auto my-5 p-2.5 bg-transparent border-l-[5px] border-l-[#1E3A8A] text-white font-light text-lg transition-all duration-200 focus:outline-none focus:bg-[#1E3A8A]/20 focus:rounded-[20px] focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="block w-[84%] mx-auto my-5 p-2.5 text-center bg-[#1E3A8A] text-white rounded disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}