"use client"

import { useState, useEffect, useRef } from "react"
import Navbar from "../componentes/navbar"
import Pusher from "pusher-js"
import { Play, User, Loader2, Clock, AlertCircle } from "lucide-react"

// URL de la API para cargar jugadores
const API_URL = "https://jenn.onrender.com"

// Configuración de Pusher
const PUSHER_KEY = "4f85ef5c792df94cebc9"
const PUSHER_CLUSTER = "us2"
const PUSHER_CHANNEL = "wsjenn"
const PUSHER_EVENT = "command"

export default function PruebaReaccion() {
  const [jugadores, setJugadores] = useState([])
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mensajeEstado, setMensajeEstado] = useState("")
  const [debugMode, setDebugMode] = useState(false)
  const [mensajesRecibidos, setMensajesRecibidos] = useState([])

  // Estados para la prueba
  const [pruebaActiva, setPruebaActiva] = useState(false)
  const [pruebaCompletada, setPruebaCompletada] = useState(false)
  const [tiempoInicio, setTiempoInicio] = useState(null)
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0)
  const timerRef = useRef(null)
  const pusherRef = useRef(null)
  const finalizadoRef = useRef(false) // Referencia para evitar múltiples finalizaciones

  // Inicializar Pusher al cargar el componente
  useEffect(() => {
    // Inicializar el cliente Pusher
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: true,
    })

    // Suscribirse al canal
    const channel = pusher.subscribe(PUSHER_CHANNEL)

    // Escuchar eventos en el canal
    channel.bind(PUSHER_EVENT, (data) => {
      console.log("Evento command recibido:", data)

      // Registrar mensaje para depuración
      setMensajesRecibidos((prev) => [
        { timestamp: new Date().toISOString(), data: JSON.stringify(data), type: "command" },
        ...prev.slice(0, 9),
      ])

      // Si recibimos "f", finalizar la prueba
      if (data.message === "f" && pruebaActiva && !finalizadoRef.current) {
        console.log("Mensaje 'f' recibido, finalizando prueba...")
        finalizadoRef.current = true
        finalizarPrueba("Prueba finalizada. Mensaje 'f' recibido del microcontrolador.")
      }
    })

    // También escuchar eventos client-message (alternativa)
    channel.bind("client-message", (data) => {
      console.log("Evento client-message recibido:", data)

      // Registrar mensaje para depuración
      setMensajesRecibidos((prev) => [
        { timestamp: new Date().toISOString(), data: JSON.stringify(data), type: "client-message" },
        ...prev.slice(0, 9),
      ])

      // Si recibimos "f", finalizar la prueba
      if (data.message === "f" && pruebaActiva && !finalizadoRef.current) {
        console.log("Mensaje 'f' recibido (client-message), finalizando prueba...")
        finalizadoRef.current = true
        finalizarPrueba("Prueba finalizada. Mensaje 'f' recibido del microcontrolador (client-message).")
      }
    })

    pusherRef.current = pusher

    // Limpiar al desmontar
    return () => {
      if (pusher) {
        pusher.unsubscribe(PUSHER_CHANNEL)
        pusher.disconnect()
      }
    }
  }, [pruebaActiva]) // Añadido pruebaActiva como dependencia

  // Cargar jugadores al iniciar
  useEffect(() => {
    cargarJugadores()
  }, [])

  // Efecto para actualizar el cronómetro
  useEffect(() => {
    if (pruebaActiva && tiempoInicio) {
      // Limpiar cualquier timer existente primero
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      timerRef.current = setInterval(() => {
        const ahora = Date.now()
        const transcurrido = (ahora - tiempoInicio) / 1000
        setTiempoTranscurrido(transcurrido)
      }, 100)
    } else if (!pruebaActiva && timerRef.current) {
      // Asegurarse de limpiar el timer cuando la prueba no está activa
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Limpiar al desmontar o cuando cambia pruebaActiva
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [pruebaActiva, tiempoInicio])

  // Función para enviar comando al ESP32
  const enviarComandoA = async () => {
    try {
      setLoading(true)
      setMensajeEstado("Iniciando prueba...")

      // Enviar el comando a través del backend
      const response = await fetch(`${API_URL}/esp32/comando`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comando: "A",
          userId: jugadorSeleccionado?.id || "test-user",
        }),
      })

      if (!response.ok) {
        throw new Error("Error al enviar comando")
      }

      setMensajeEstado("Prueba en curso. Esperando respuesta del microcontrolador...")
      console.log("Comando A enviado al ESP32")
    } catch (error) {
      console.error("Error:", error)
      setMensajeEstado(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Función para finalizar manualmente la prueba (para casos donde no se recibe "f")
  const finalizarManualmente = () => {
    if (pruebaActiva && !finalizadoRef.current) {
      finalizadoRef.current = true
      finalizarPrueba("Prueba finalizada manualmente.")
    }
  }

  // Función para cargar jugadores desde la API
  const cargarJugadores = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/usuarios`, {
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener usuarios")
      }

      const data = await response.json()

      // Filtrar solo los usuarios con rol "jugador"
      const soloJugadores = data.filter((usuario) => usuario.rol === "jugador")
      setJugadores(soloJugadores)
      setError("")
    } catch (error) {
      console.error("Error:", error)
      setError("Error al cargar los jugadores. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Manejar cambio de jugador seleccionado
  const handleJugadorChange = (e) => {
    const jugadorId = e.target.value
    if (jugadorId) {
      const jugador = jugadores.find((j) => j.id.toString() === jugadorId)
      setJugadorSeleccionado(jugador)
    } else {
      setJugadorSeleccionado(null)
    }
  }

  // Iniciar la prueba
  const iniciarPrueba = () => {
    if (!jugadorSeleccionado) return

    // Reiniciar el estado de finalización
    finalizadoRef.current = false

    setPruebaActiva(true)
    setPruebaCompletada(false)
    setTiempoInicio(Date.now())
    setTiempoTranscurrido(0)
    setMensajeEstado("")
    setMensajesRecibidos([])

    // Enviar comando "A" al ESP32
    enviarComandoA()
  }

  // Finalizar la prueba
  const finalizarPrueba = (mensaje = "Prueba finalizada") => {
    console.log("Ejecutando finalizarPrueba, estado actual:", { pruebaActiva, pruebaCompletada })

    if (!pruebaActiva) return

    // Detener el cronómetro inmediatamente
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Actualizar estados
    setPruebaActiva(false)
    setPruebaCompletada(true)
    setMensajeEstado(mensaje)

    console.log("Prueba finalizada, cronómetro detenido en:", tiempoTranscurrido)
  }

  // Reiniciar la prueba
  const reiniciarPrueba = () => {
    // Reiniciar el estado de finalización
    finalizadoRef.current = false

    setPruebaActiva(false)
    setPruebaCompletada(false)
    setTiempoTranscurrido(0)
    setTiempoInicio(null)
    setMensajeEstado("")
    setMensajesRecibidos([])

    // Asegurarse de que el cronómetro esté detenido
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // Formatear tiempo para mostrar
  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60)
    const segs = Math.floor(segundos % 60)
    const milis = Math.floor((segundos * 100) % 100)

    return `${minutos.toString().padStart(2, "0")}:${segs.toString().padStart(2, "0")}.${milis.toString().padStart(2, "0")}`
  }

  // Alternar modo de depuración
  const toggleDebugMode = () => {
    setDebugMode(!debugMode)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="sticky top-0 z-10">
        <Navbar />
      </div>

      <div className="flex-grow container mx-auto p-4 mt-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-4xl font-bold mb-8 text-[#1E3A8A] flex items-center justify-center">
            <Clock className="mr-3 h-8 w-8" />
            Prueba de Reacción - Modo A
          </h1>

          {/* Selector de jugador */}
          <div className="mb-8 max-w-md mx-auto">
            <label htmlFor="jugador" className="block text-lg font-medium text-gray-700 mb-2 text-left">
              Seleccionar Jugador:
            </label>

            {loading && !pruebaActiva ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#1E3A8A] mr-2" />
                <span>Cargando jugadores...</span>
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <select
                id="jugador"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#1E3A8A] focus:border-[#1E3A8A] text-gray-800"
                onChange={handleJugadorChange}
                value={jugadorSeleccionado?.id || ""}
                disabled={pruebaActiva}
              >
                <option value="">Seleccione un jugador</option>
                {jugadores.map((jugador) => (
                  <option key={jugador.id} value={jugador.id}>
                    {jugador.nombre} {jugador.apellido}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Información del jugador seleccionado */}
          {jugadorSeleccionado && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-3 text-[#1E3A8A] flex items-center justify-center">
                <User className="mr-2" />
                Información del Jugador
              </h2>

              <div className="text-left">
                <p className="text-gray-500 text-sm">Nombre completo:</p>
                <p className="font-medium text-gray-800 mb-2">
                  {jugadorSeleccionado.nombre} {jugadorSeleccionado.apellido}
                </p>

                <p className="text-gray-500 text-sm">Carrera:</p>
                <p className="font-medium text-gray-800">{jugadorSeleccionado.carrera || "No especificada"}</p>
              </div>
            </div>
          )}

          {/* Cronómetro */}
          <div className="mb-8 max-w-md mx-auto">
            <div className="p-6 bg-[#F0F4FF] rounded-lg border border-[#D0D8F0] text-center">
              <h2 className="text-xl font-semibold mb-3 text-[#1E3A8A]">Cronómetro</h2>
              <div className="text-5xl font-bold tabular-nums text-[#1E3A8A]">
                {formatearTiempo(tiempoTranscurrido)}
              </div>
              <p className="mt-2 text-gray-500 text-sm">
                {pruebaActiva
                  ? "Prueba en curso. Esperando respuesta del microcontrolador..."
                  : pruebaCompletada
                    ? "Prueba finalizada"
                    : "El cronómetro iniciará al comenzar la prueba"}
              </p>

              {mensajeEstado && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-800 text-sm">{mensajeEstado}</p>
                </div>
              )}

              {/* Botón para finalizar manualmente (solo visible si la prueba está activa) */}
              {pruebaActiva && (
                <button
                  onClick={finalizarManualmente}
                  className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors flex items-center mx-auto"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Finalizar manualmente
                </button>
              )}
            </div>
          </div>

          {/* Botón de inicio */}
          <div className="flex justify-center my-8">
            {!pruebaActiva && !pruebaCompletada && (
              <button
                onClick={iniciarPrueba}
                className={`w-64 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg transition-colors bg-[#1E3A8A] hover:bg-[#4F85E5] ${!jugadorSeleccionado ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-label="Iniciar prueba de reacción"
                disabled={!jugadorSeleccionado || pruebaActiva || loading}
              >
                <div className="flex items-center">
                  <Play size={24} className="mr-2" />
                  <span>Iniciar Prueba</span>
                </div>
              </button>
            )}

            {pruebaActiva && (
              <div className="text-center">
                <div className="w-64 h-16 rounded-lg bg-yellow-500 flex items-center justify-center text-white font-bold text-xl shadow-lg animate-pulse">
                  <div className="flex items-center">
                    <Loader2 size={24} className="mr-2 animate-spin" />
                    <span>Prueba en curso...</span>
                  </div>
                </div>
              </div>
            )}

            {pruebaCompletada && (
              <button
                onClick={reiniciarPrueba}
                className="w-64 h-16 rounded-lg bg-gray-500 flex items-center justify-center text-white font-bold text-xl shadow-lg hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center">
                  <Play size={24} className="mr-2" />
                  <span>Nueva Prueba</span>
                </div>
              </button>
            )}
          </div>

          {/* Resultados de la prueba */}
          {pruebaCompletada && (
            <div className="bg-[#F0F4FF] p-6 rounded-lg border border-[#D0D8F0] max-w-lg mx-auto">
              <h2 className="text-xl font-semibold mb-4 text-[#1E3A8A]">Resultados de la Prueba</h2>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-gray-500 text-sm">Tiempo total</p>
                <p className="text-3xl font-bold text-[#1E3A8A]">{formatearTiempo(tiempoTranscurrido)}</p>
              </div>
            </div>
          )}

          {/* Botón para activar modo de depuración */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={toggleDebugMode}
              className="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              {debugMode ? "Ocultar depuración" : "Mostrar depuración"}
            </button>
          </div>

          {/* Panel de depuración */}
          {debugMode && (
            <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg max-w-2xl mx-auto text-left">
              <h3 className="text-lg font-semibold mb-2">Estado actual:</h3>
              <div className="mb-4 font-mono text-sm">
                <div>pruebaActiva: {pruebaActiva ? "true" : "false"}</div>
                <div>pruebaCompletada: {pruebaCompletada ? "true" : "false"}</div>
                <div>timerRef activo: {timerRef.current ? "true" : "false"}</div>
                <div>finalizadoRef: {finalizadoRef.current ? "true" : "false"}</div>
              </div>

              <h3 className="text-lg font-semibold mb-2">Mensajes recibidos:</h3>
              <div className="max-h-60 overflow-y-auto">
                {mensajesRecibidos.length > 0 ? (
                  mensajesRecibidos.map((msg, index) => (
                    <div key={index} className="mb-2 border-b border-gray-700 pb-2">
                      <div className="text-xs text-gray-400">
                        {msg.timestamp} - Tipo: {msg.type || "desconocido"}
                      </div>
                      <div className="font-mono text-sm break-all">{msg.data}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic">No se han recibido mensajes</p>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 text-gray-600">
            <h2 className="text-xl font-semibold mb-4 text-[#1E3A8A]">Instrucciones:</h2>
            <ol className="text-left max-w-2xl mx-auto space-y-2">
              <li>1. Selecciona un jugador de la lista.</li>
              <li>2. Presiona el botón "Iniciar Prueba" para enviar el comando "A" al microcontrolador.</li>
              <li>3. El cronómetro comenzará automáticamente.</li>
              <li>4. La prueba finalizará cuando el microcontrolador envíe el mensaje "f".</li>
              <li>5. Si el cronómetro no se detiene automáticamente, puedes usar el botón "Finalizar manualmente".</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
