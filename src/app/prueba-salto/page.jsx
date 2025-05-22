"use client"

import { useState, useEffect, useRef } from "react"
import Navbar from "../componentes/navbar"
import Pusher from "pusher-js"
import { Play, User, Loader2, AlertCircle, CheckCircle, Save, Repeat, BarChart3 } from "lucide-react"

// URL de la API para cargar jugadores
const API_URL = "https://jenn.onrender.com"

// Configuración de Pusher
const PUSHER_KEY = "4f85ef5c792df94cebc9"
const PUSHER_CLUSTER = "us2"
const PUSHER_CHANNEL = "wsjenn"
const PUSHER_EVENT = "command"

export default function AlfombraTest() {
  // Estados para usuarios y selección
  const [jugadores, setJugadores] = useState([])
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Estados para la prueba
  const [pruebaActiva, setPruebaActiva] = useState(false)
  const [pruebaCompletada, setPruebaCompletada] = useState(false)
  const [mensajeEstado, setMensajeEstado] = useState("")
  const [numRepeticiones, setNumRepeticiones] = useState(5)
  const [enviandoNumero, setEnviandoNumero] = useState(false)

  // Estados para contabilizar secuencias
  const [secuenciaActual, setSecuenciaActual] = useState([])
  const [secuenciaRecibida, setSecuenciaRecibida] = useState([])
  const [numAciertos, setNumAciertos] = useState(0)
  const [numIntentos, setNumIntentos] = useState(0)

  // Estados para depuración
  const [debugMode, setDebugMode] = useState(false)
  const [mensajesRecibidos, setMensajesRecibidos] = useState([])

  // Referencias para controlar el flujo
  const pusherRef = useRef(null)
  const finalizadoRef = useRef(false)
  const primeraSecuenciaRef = useRef(true)
  const resultadosGuardadosRef = useRef(false)
  const secuenciaEnProcesoRef = useRef(false)
  const datosResultadoRef = useRef(null)

  // Función para procesar mensajes recibidos
  const procesarMensaje = (mensaje) => {
    console.log("Procesando mensaje:", mensaje)

    // Ignorar mensajes si la prueba ya está finalizada o completada
    if (finalizadoRef.current || pruebaCompletada) {
      console.log("Ignorando mensaje porque la prueba ya está finalizada o completada:", mensaje)
      return
    }

    // Si recibimos "f", finalizar el intento actual
    if (mensaje === "f") {
      finalizarIntento()
      return
    }

    // Ignorar el mensaje con el número de repeticiones en la primera secuencia
    if (mensaje === numRepeticiones.toString() && primeraSecuenciaRef.current) {
      console.log(`Ignorando el mensaje '${numRepeticiones}' en la primera secuencia`)
      primeraSecuenciaRef.current = false
      return
    }

    // Actualizar la secuencia actual para visualización
    setSecuenciaActual((prev) => {
      const nuevaSecuencia = [...prev, mensaje]
      console.log("Secuencia actual actualizada:", nuevaSecuencia)
      return nuevaSecuencia
    })

    // Evitar contar doble las secuencias
    if (secuenciaEnProcesoRef.current) {
      console.log("Secuencia en proceso, ignorando mensaje:", mensaje)
      return
    }

    // Actualizar la secuencia recibida para verificar D, E, J
    setSecuenciaRecibida((prev) => {
      const nuevaSecuencia = [...prev, mensaje]
      console.log("Secuencia recibida actualizada:", nuevaSecuencia)

      // Verificar si tenemos una secuencia D, E, J (que ahora mostramos como 1, 2, 3)
      if (nuevaSecuencia.length >= 3 && !secuenciaEnProcesoRef.current) {
        const ultimosTres = nuevaSecuencia.slice(-3)
        console.log("Verificando últimos tres mensajes:", ultimosTres)

        if (ultimosTres[0] === "D" && ultimosTres[1] === "E" && ultimosTres[2] === "J") {
          console.log("¡Secuencia D, E, J detectada! Incrementando aciertos.")
          secuenciaEnProcesoRef.current = true // Marcar secuencia en proceso para evitar contar doble
          setNumAciertos((prev) => prev + 1)
          setMensajeEstado("¡Acierto! Secuencia 1, 2, 3 completada")
        }
      }

      return nuevaSecuencia
    })
  }

  // Función para finalizar el intento actual
  const finalizarIntento = () => {
    // Verificar si ya estamos en proceso de finalización para evitar bucles
    if (finalizadoRef.current) {
      console.log("Ya estamos finalizando, ignorando llamada adicional a finalizarIntento")
      return
    }

    // Incrementar el contador de intentos (uno por prueba finalizada)
    setNumIntentos((prev) => {
      const nuevoNumIntentos = prev + 1
      console.log(`Intento finalizado. Nuevo contador: ${nuevoNumIntentos} de ${numRepeticiones}`)

      // Verificar si se ha alcanzado el número de repeticiones
      if (nuevoNumIntentos >= numRepeticiones) {
        console.log("Se alcanzó el número máximo de repeticiones. Finalizando prueba...")
        // Marcar como finalizado para evitar múltiples llamadas
        finalizadoRef.current = true
        // Usar setTimeout para asegurar que el estado se actualice antes de finalizar
        setTimeout(() => finalizarPrueba("Prueba finalizada. Se completaron todas las repeticiones."), 100)
      }

      return nuevoNumIntentos
    })

    // Reiniciar la secuencia actual
    setSecuenciaActual([])
    setSecuenciaRecibida([])
    secuenciaEnProcesoRef.current = false // Resetear el flag de secuencia en proceso

    setMensajeEstado("Intento finalizado. Mensaje 'f' recibido.")
  }

  // Función para finalizar la prueba
  const finalizarPrueba = async (mensaje = "Prueba finalizada") => {
    console.log("Ejecutando finalizarPrueba, estado actual:", { pruebaActiva, pruebaCompletada })

    if (!pruebaActiva || pruebaCompletada) {
      console.log("La prueba ya no está activa o ya está completada, ignorando llamada a finalizarPrueba")
      return
    }

    // Si se finaliza manualmente y no se ha contado un intento (no se recibió 'f')
    if (!secuenciaActual.includes("f") && !finalizadoRef.current) {
      finalizarIntento()
    }

    // Actualizar estados
    setPruebaActiva(false)
    setPruebaCompletada(true)
    setMensajeEstado(mensaje)

    // Preparar datos para mostrar al usuario
    datosResultadoRef.current = {
      jugador_id: jugadorSeleccionado?.id,
      repeticiones: numRepeticiones,
      aciertos: numAciertos,
    }

    console.log("Prueba finalizada. Datos:", datosResultadoRef.current)
  }

  // Cargar jugadores al iniciar
  useEffect(() => {
    cargarJugadores()
  }, [])

  // Función para cargar jugadores desde la API
  const cargarJugadores = async () => {
    try {
      setLoading(true)
      setError("")
      console.log("Iniciando carga de jugadores desde:", `${API_URL}/usuarios`)

      const response = await fetch(`${API_URL}/usuarios`, {
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error al obtener usuarios: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Datos recibidos de la API:", data)

      if (!Array.isArray(data)) {
        throw new Error(`Respuesta inesperada: los datos no son un array. Recibido: ${typeof data}`)
      }

      // Filtrar solo los usuarios con rol "jugador"
      let soloJugadores = []

      // Intentar diferentes propiedades para el rol
      if (data.some((usuario) => usuario.rol !== undefined)) {
        console.log("Filtrando por propiedad 'rol'")
        soloJugadores = data.filter((usuario) => usuario.rol === "jugador")
      } else if (data.some((usuario) => usuario.role !== undefined)) {
        console.log("Filtrando por propiedad 'role'")
        soloJugadores = data.filter((usuario) => usuario.role === "jugador")
      } else {
        console.log("No se encontró propiedad de rol, usando todos los usuarios")
        soloJugadores = data
      }

      console.log(`Se encontraron ${soloJugadores.length} jugadores de ${data.length} usuarios`)
      setJugadores(soloJugadores)
      setError("")
    } catch (error) {
      console.error("Error al cargar jugadores:", error)
      setError(`Error al cargar los jugadores: ${error.message}`)
      setJugadores([]) // Limpiar el estado en caso de error
    } finally {
      setLoading(false)
    }
  }

  // Inicializar Pusher al cargar el componente
  useEffect(() => {
    // Si la prueba está completada, no necesitamos escuchar eventos
    if (pruebaCompletada) {
      console.log("Prueba completada, desconectando Pusher")
      if (pusherRef.current) {
        pusherRef.current.unsubscribe(PUSHER_CHANNEL)
        pusherRef.current.disconnect()
      }
      return
    }

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

      // Procesar el mensaje recibido
      if (pruebaActiva && data.message && !pruebaCompletada && !finalizadoRef.current) {
        procesarMensaje(data.message)
      } else {
        console.log("Ignorando mensaje porque la prueba no está activa o ya está completada")
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

      // Procesar el mensaje recibido
      if (pruebaActiva && data.message && !pruebaCompletada && !finalizadoRef.current) {
        procesarMensaje(data.message)
      } else {
        console.log("Ignorando mensaje porque la prueba no está activa o ya está completada")
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
  }, [pruebaActiva, pruebaCompletada])

  // Iniciar la prueba
  const iniciarPrueba = async () => {
    if (!jugadorSeleccionado) return

    // Reiniciar el estado de finalización
    finalizadoRef.current = false
    primeraSecuenciaRef.current = true
    resultadosGuardadosRef.current = false
    secuenciaEnProcesoRef.current = false
    datosResultadoRef.current = null

    setPruebaActiva(true)
    setPruebaCompletada(false)
    setMensajeEstado("")
    setMensajesRecibidos([])
    setSecuenciaActual([])
    setSecuenciaRecibida([])
    setNumAciertos(0)
    setNumIntentos(0)

    try {
      // Enviar solo el número de repeticiones
      setMensajeEstado(`Enviando número de repeticiones: ${numRepeticiones}...`)
      setEnviandoNumero(true)

      const responseNum = await fetch(`${API_URL}/esp32/comando`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comando: numRepeticiones.toString(),
          userId: jugadorSeleccionado?.id || "test-user",
        }),
      })

      if (!responseNum.ok) {
        throw new Error("Error al enviar número de repeticiones")
      }

      setMensajeEstado("Prueba en curso. Esperando respuesta del microcontrolador...")
      console.log("Número de repeticiones enviado al ESP32:", numRepeticiones)
    } catch (error) {
      console.error("Error:", error)
      setMensajeEstado(`Error: ${error.message}`)
      setPruebaActiva(false)
    } finally {
      setEnviandoNumero(false)
    }
  }

  // Función para guardar los resultados de la prueba
  const guardarResultados = async () => {
    if (!jugadorSeleccionado || !pruebaCompletada || resultadosGuardadosRef.current) return

    try {
      setMensajeEstado("Guardando resultados...")

      const datosAGuardar = {
        jugador_id: jugadorSeleccionado.id,
        repeticiones: numRepeticiones,
        aciertos: numAciertos,
      }

      console.log("Guardando resultados:", datosAGuardar)
      resultadosGuardadosRef.current = true // Marcar como guardado antes de la petición para evitar duplicados

      const response = await fetch(`${API_URL}/alfombras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosAGuardar),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Error al guardar resultados: ${response.status} ${errorData.message || ""}`)
      }

      const data = await response.json()
      console.log("Resultados guardados exitosamente:", data)
      setMensajeEstado("Resultados guardados exitosamente")
    } catch (error) {
      console.error("Error al guardar resultados:", error)
      setMensajeEstado(`Error al guardar resultados: ${error.message}`)
      resultadosGuardadosRef.current = false // Resetear si hay error para permitir reintentar
    }
  }

  // Reiniciar la prueba
  const reiniciarPrueba = () => {
    // Reiniciar el estado de finalización
    finalizadoRef.current = false
    primeraSecuenciaRef.current = true
    resultadosGuardadosRef.current = false
    secuenciaEnProcesoRef.current = false
    datosResultadoRef.current = null

    setPruebaActiva(false)
    setPruebaCompletada(false)
    setMensajeEstado("")
    setMensajesRecibidos([])
    setSecuenciaActual([])
    setSecuenciaRecibida([])
    setNumAciertos(0)
    setNumIntentos(0)
  }

  // Finalizar manualmente la prueba
  const finalizarManualmente = () => {
    finalizadoRef.current = true
    finalizarPrueba("Prueba finalizada manualmente.")
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

  // Manejar cambio en el número de repeticiones
  const handleRepeticionesChange = (e) => {
    const valor = Number.parseInt(e.target.value)
    if (!isNaN(valor) && valor > 0) {
      setNumRepeticiones(valor)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-10">
        <Navbar />
      </div>

      <main className="flex-grow container mx-auto p-4 mt-4">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 pb-3 border-b-2 border-gray-300">
            Prueba de Secuencia de Salto
          </h2>

          {/* Sección superior: Selector de jugador y número de repeticiones en fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-5 bg-blue-900/10 rounded-xl border border-blue-900/20">
            <h3 className="text-xl font-semibold text-blue-900 col-span-full mb-3 pb-2 border-b border-blue-900/20">
              Configuración
            </h3>

            {/* Selector de jugador */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
              <label
                htmlFor="jugador"
                className="block text-lg font-medium text-gray-700 mb-3 pb-2 border-b border-gray-200"
              >
                Seleccionar Jugador:
              </label>

              {loading && !pruebaActiva ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-800 mr-2" />
                  <span>Cargando jugadores...</span>
                </div>
              ) : error ? (
                <div className="text-red-600">{error}</div>
              ) : jugadores.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                  No se encontraron jugadores.{" "}
                  <button onClick={cargarJugadores} className="underline text-blue-800">
                    Reintentar
                  </button>
                </div>
              ) : (
                <>
                  <select
                    id="jugador"
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-800 focus:border-blue-800 text-gray-800 transition-all duration-300"
                    onChange={handleJugadorChange}
                    value={jugadorSeleccionado?.id || ""}
                    disabled={pruebaActiva}
                  >
                    <option value="">Seleccione un jugador</option>
                    {jugadores.map((jugador) => (
                      <option key={jugador.id || Math.random()} value={jugador.id || ""}>
                        {jugador.nombre || "Sin nombre"} {jugador.apellido || ""}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">{jugadores.length} jugadores disponibles</p>
                </>
              )}
            </div>

            {/* Campo para número de repeticiones */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
              <label
                htmlFor="repeticiones"
                className="block text-lg font-medium text-gray-700 mb-3 pb-2 border-b border-gray-200"
              >
                Número de Repeticiones:
              </label>
              <div className="flex items-center">
                <Repeat className="h-5 w-5 text-blue-800 mr-2" />
                <input
                  id="repeticiones"
                  type="number"
                  min="1"
                  value={numRepeticiones}
                  onChange={handleRepeticionesChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-800 focus:border-blue-800 text-gray-800 transition-all duration-300"
                  disabled={pruebaActiva}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">Este número se enviará al iniciar la prueba.</p>
            </div>
          </div>

          {/* Sección media: Información del jugador y contadores en fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Información del jugador seleccionado */}
            <div>
              {jugadorSeleccionado && (
                <div className="p-5 bg-green-900/10 rounded-xl shadow-sm border border-green-900/20 h-full transition-all duration-300 hover:shadow-md">
                  <h3 className="text-xl font-semibold mb-3 text-green-900 flex items-center pb-2 border-b border-green-900/20">
                    <User className="mr-2" />
                    Información del Jugador
                  </h3>

                  <div className="text-left">
                    <p className="text-gray-600 text-sm">Nombre completo:</p>
                    <p className="font-medium text-gray-800 mb-2">
                      {jugadorSeleccionado.nombre} {jugadorSeleccionado.apellido}
                    </p>

                    <p className="text-gray-600 text-sm">Carrera:</p>
                    <p className="font-medium text-gray-800">{jugadorSeleccionado.carrera || "No especificada"}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contadores y progreso */}
            <div>
              <div className="p-5 bg-gray-100 rounded-xl shadow-sm border border-gray-200 h-full transition-all duration-300 hover:shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-gray-700 pb-2 border-b border-gray-200">Progreso</h3>

                {/* Contadores de aciertos e intentos en fila */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-green-900/20 transition-all duration-300 hover:border-green-900/30">
                    <div className="flex items-center justify-center mb-1">
                      <CheckCircle className="h-5 w-5 text-green-800 mr-2" />
                      <span className="font-medium text-gray-800">Aciertos</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-800">{numAciertos}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-300 transition-all duration-300 hover:border-gray-400">
                    <div className="flex items-center justify-center mb-1">
                      <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="font-medium text-gray-800">Intentos</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-800">{numIntentos}</div>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-800/70 to-blue-900/70 h-4 rounded-full transition-all duration-500 ease-in-out"
                      style={{ width: `${Math.min(100, (numIntentos / numRepeticiones) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {numIntentos} de {numRepeticiones} repeticiones
                  </p>
                </div>

                {/* Mensaje de estado */}
                {mensajeEstado && (
                  <div className="mt-3 p-2 bg-gray-100 border border-gray-200 rounded-lg">
                    <p className="text-gray-700 text-sm">{mensajeEstado}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección inferior: Secuencia esperada y meta en fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-5 bg-blue-900/5 rounded-xl border border-blue-900/10">
            <h3 className="text-xl font-semibold text-gray-700 col-span-full mb-3 pb-2 border-b border-gray-300">
              Secuencia y Meta
            </h3>

            {/* Secuencia esperada */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-center mb-3 text-gray-700 font-semibold">
                <span>Secuencia Esperada</span>
              </div>
              <div className="flex justify-center space-x-6">
                {["1", "2", "3"].map((numero, index) => (
                  <div
                    key={index}
                    className={`w-14 h-14 flex items-center justify-center rounded-full font-bold text-lg shadow-sm transition-all duration-300
                ${
                  secuenciaRecibida.length > 0 &&
                  secuenciaRecibida.slice(-3).length > index &&
                  secuenciaRecibida.slice(-3)[index] === (index === 0 ? "D" : index === 1 ? "E" : "J")
                    ? "bg-blue-900/10 text-blue-900 border border-blue-900/20 shadow-md"
                    : "bg-white text-gray-700 border border-gray-200"
                }`}
                  >
                    {numero}
                  </div>
                ))}
              </div>
            </div>

            {/* Meta de repeticiones */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-center mb-3 text-gray-700 font-semibold">
                <Repeat className="h-5 w-5 text-gray-600 mr-2" />
                <span>Meta</span>
              </div>
              <div className="text-3xl font-bold text-gray-800 text-center">{numRepeticiones}</div>
            </div>
          </div>

          {/* Botón para finalizar manualmente (solo visible si la prueba está activa) */}
          {pruebaActiva && (
            <div className="flex justify-center mb-6">
              <button
                onClick={finalizarManualmente}
                className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 flex items-center shadow-sm"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Finalizar manualmente
              </button>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 p-5 bg-green-900/5 rounded-xl border border-green-900/10">
            <h3 className="text-xl font-semibold text-green-900 w-full text-center mb-3 pb-2 border-b border-green-900/20">
              Acciones
            </h3>

            {!pruebaActiva && !pruebaCompletada && (
              <button
                onClick={iniciarPrueba}
                className={`px-6 py-3 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm transition-all duration-300 bg-blue-800 hover:bg-blue-900 ${!jugadorSeleccionado ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={!jugadorSeleccionado || pruebaActiva || loading || enviandoNumero}
              >
                <div className="flex items-center">
                  {enviandoNumero ? (
                    <Loader2 size={24} className="mr-2 animate-spin" />
                  ) : (
                    <Play size={24} className="mr-2" />
                  )}
                  <span>{enviandoNumero ? "Enviando..." : "Iniciar Prueba"}</span>
                </div>
              </button>
            )}

            {pruebaActiva && (
              <div className="text-center">
                <div className="px-6 py-3 rounded-lg bg-blue-800/80 flex items-center justify-center text-white font-bold text-lg shadow-sm animate-pulse">
                  <div className="flex items-center">
                    <Loader2 size={24} className="mr-2 animate-spin" />
                    <span>Prueba en curso...</span>
                  </div>
                </div>
              </div>
            )}

            {pruebaCompletada && (
              <>
                <button
                  onClick={guardarResultados}
                  className={`px-6 py-3 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm transition-all duration-300 bg-green-800 hover:bg-green-900 ${resultadosGuardadosRef.current ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={resultadosGuardadosRef.current}
                >
                  <div className="flex items-center">
                    <Save size={24} className="mr-2" />
                    <span>Guardar Resultados</span>
                  </div>
                </button>

                <button
                  onClick={reiniciarPrueba}
                  className="px-6 py-3 rounded-lg bg-gray-600 flex items-center justify-center text-white font-bold text-lg shadow-sm hover:bg-gray-700 transition-all duration-300"
                >
                  <div className="flex items-center">
                    <Play size={24} className="mr-2" />
                    <span>Nueva Prueba</span>
                  </div>
                </button>
              </>
            )}
          </div>

          {/* Resultados de la prueba */}
          {pruebaCompletada && datosResultadoRef.current && (
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-700 text-center pb-2 border-b border-gray-200">
                Resultados de la Prueba
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-green-900/20 transition-all duration-300 hover:shadow-md">
                  <p className="text-gray-700 text-sm font-medium">Aciertos</p>
                  <p className="text-2xl font-bold text-green-900">{numAciertos}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
                  <p className="text-gray-700 text-sm font-medium">Intentos</p>
                  <p className="text-2xl font-bold text-gray-800">{numIntentos}</p>
                </div>
                {numIntentos > 0 && (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-900/20 transition-all duration-300 hover:shadow-md">
                    <p className="text-gray-700 text-sm font-medium">Tasa de aciertos</p>
                    <p className="text-2xl font-bold text-blue-900">{Math.round((numAciertos / numIntentos) * 100)}%</p>
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <p className="text-gray-700 text-sm font-medium pb-1 border-b border-gray-200">Datos a guardar:</p>
                <div className="mt-2 text-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  <p>
                    <span className="font-medium">Jugador:</span> {jugadorSeleccionado?.nombre}{" "}
                    {jugadorSeleccionado?.apellido}
                  </p>
                  <p>
                    <span className="font-medium">ID:</span> {datosResultadoRef.current.jugador_id}
                  </p>
                  <p>
                    <span className="font-medium">Repeticiones:</span> {datosResultadoRef.current.repeticiones}
                  </p>
                  <p>
                    <span className="font-medium">Aciertos:</span> {datosResultadoRef.current.aciertos}
                  </p>
                </div>
              </div>

              {resultadosGuardadosRef.current && (
                <div className="mt-4 p-3 bg-green-900/10 border border-green-900/20 rounded-lg shadow-inner">
                  <p className="text-green-900 flex items-center justify-center font-medium">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Resultados guardados exitosamente
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white shadow-md py-4 px-6 mt-8 border-t border-gray-200">
        <div className="container mx-auto text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} Prueba de Salto - Todos los derechos reservados
        </div>
      </footer>
    </div>
  )
}
