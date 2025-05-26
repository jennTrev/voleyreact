"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../componentes/navbar"
import { BarChart3, Target, Zap, Activity } from "lucide-react"

const API_URL = "https://jenn.onrender.com"

export default function MisEstadisticas() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pruebas, setPruebas] = useState(null)
  const [estadisticas, setEstadisticas] = useState(null)
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
        // Obtener información del usuario
        const userResponse = await fetch(`${API_URL}/usuarios/${userId}`)
        if (!userResponse.ok) {
          throw new Error("No se pudo obtener la información del usuario")
        }
        const userData = await userResponse.json()
        setUser(userData)

        // Obtener pruebas del usuario
        const pruebasResponse = await fetch(`${API_URL}/usuario/${userId}/pruebas`)
        if (pruebasResponse.ok) {
          const pruebasData = await pruebasResponse.json()
          setPruebas(pruebasData.data)
        }

        // Obtener estadísticas del usuario
        const estadisticasResponse = await fetch(`${API_URL}/usuario/${userId}/estadisticas`)
        if (estadisticasResponse.ok) {
          const estadisticasData = await estadisticasResponse.json()
          setEstadisticas(estadisticasData.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-medium text-gray-800">Cargando estadísticas...</p>
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
          <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <BarChart3 className="mr-2 h-8 w-8 text-[#1E3A8A]" />
            Mis Estadísticas - {user?.nombre} {user?.apellido}
          </h1>

          {/* Estadísticas Generales */}
          {estadisticas && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Estadísticas de Alfombra */}
              <div className="bg-[#F0F4FF] p-4 rounded border border-[#D0D8F0]">
                <h2 className="text-lg font-semibold mb-4 text-[#1E3A8A] flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Estadísticas de Alfombra
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Total de pruebas:</span>
                    <span className="text-gray-700">{estadisticas.estadisticas.alfombra.total_pruebas || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Promedio de aciertos:</span>
                    <span className="text-gray-700">
                      {Number.parseFloat(estadisticas.estadisticas.alfombra.promedio_aciertos || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Precisión promedio:</span>
                    <span className="text-green-600 font-bold">
                      {Number.parseFloat(estadisticas.estadisticas.alfombra.porcentaje_aciertos || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Mejor puntuación:</span>
                    <span className="text-blue-600 font-bold">
                      {estadisticas.estadisticas.alfombra.mejor_aciertos || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estadísticas de Reacción */}
              <div className="bg-[#F0F4FF] p-4 rounded border border-[#D0D8F0]">
                <h2 className="text-lg font-semibold mb-4 text-[#1E3A8A] flex items-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Estadísticas de Reacción
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Total de pruebas:</span>
                    <span className="text-gray-700">{estadisticas.estadisticas.reaccion.total_pruebas || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Promedio de aciertos:</span>
                    <span className="text-gray-700">
                      {Number.parseFloat(estadisticas.estadisticas.reaccion.promedio_aciertos || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Tiempo promedio:</span>
                    <span className="text-orange-600 font-bold">
                      {Number.parseFloat(estadisticas.estadisticas.reaccion.tiempo_promedio || 0).toFixed(3)}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Mejor tiempo:</span>
                    <span className="text-blue-600 font-bold">
                      {Number.parseFloat(estadisticas.estadisticas.reaccion.mejor_tiempo || 0).toFixed(3)}s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Historial de Pruebas */}
          {pruebas && (
            <div className="space-y-6">
              {/* Pruebas de Alfombra */}
              {pruebas.pruebas.alfombra.length > 0 && (
                <div className="bg-[#F0F4FF] p-4 rounded border border-[#D0D8F0]">
                  <h2 className="text-lg font-semibold mb-4 text-[#1E3A8A] flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Historial de Pruebas de Alfombra
                  </h2>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {pruebas.pruebas.alfombra.slice(0, 10).map((prueba, index) => (
                      <div
                        key={prueba.id}
                        className="bg-white p-3 rounded border border-gray-200 flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium text-gray-800">Prueba #{index + 1}</span>
                          <p className="text-sm text-gray-600">
                            {new Date(prueba.createdAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {prueba.aciertos}/{prueba.repeticiones}
                          </p>
                          <p className="text-xs text-gray-500">
                            {((prueba.aciertos / prueba.repeticiones) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pruebas de Reacción */}
              {pruebas.pruebas.reaccion.length > 0 && (
                <div className="bg-[#F0F4FF] p-4 rounded border border-[#D0D8F0]">
                  <h2 className="text-lg font-semibold mb-4 text-[#1E3A8A] flex items-center">
                    <Zap className="mr-2 h-5 w-5" />
                    Historial de Pruebas de Reacción
                  </h2>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {pruebas.pruebas.reaccion.slice(0, 10).map((prueba, index) => (
                      <div
                        key={prueba.id}
                        className="bg-white p-3 rounded border border-gray-200 flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium text-gray-800">Prueba #{index + 1}</span>
                          <p className="text-sm text-gray-600">
                            {new Date(prueba.createdAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{prueba.aciertos} aciertos</p>
                          <p className="text-xs text-gray-500">{prueba.tiempo_total.toFixed(3)}s</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mensaje si no hay datos */}
          {(!pruebas || (pruebas.pruebas.alfombra.length === 0 && pruebas.pruebas.reaccion.length === 0)) && (
            <div className="bg-gray-50 p-8 rounded border border-gray-200 text-center">
              <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No hay pruebas registradas</h3>
              <p className="text-gray-600">Realiza algunas pruebas para ver tus estadísticas aquí.</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#1E3A8A] text-white rounded hover:bg-[#2D4BA0] transition-colors"
            >
              Actualizar Estadísticas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
