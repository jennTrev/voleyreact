"use client"

import { useState, useEffect, useRef } from "react"
import { Power, Lightbulb, Zap, Bug, Trash2, Wifi, WifiOff, Eye, EyeOff } from "lucide-react"
import Pusher from "pusher-js"

// URL de la API
const API_URL = "https://jenn.onrender.com"

// Configuración de Pusher
const PUSHER_KEY = "4f85ef5c792df94cebc9"
const PUSHER_CLUSTER = "us2"
const PUSHER_CHANNEL = "wsjenn"
const PUSHER_EVENT = "command"

export default function MonitoringControl() {
  // Estados para los controles
  const [releActivo, setReleActivo] = useState(false)
  const [ledsActivos, setLedsActivos] = useState(false)
  const [enviandoComando, setEnviandoComando] = useState(false)

  // Estados para la conexión
  const [conectado, setConectado] = useState(false)
  const [estadoConexion, setEstadoConexion] = useState("Desconectado")

  // Estados para monitoreo automático
  const [monitoreoActivo, setMonitoreoActivo] = useState(true)
  const [ultimaActualizacion, setUltimaActualizacion] = useState("")

  // Estados para depuración
  const [debugMode, setDebugMode] = useState(true)
  const [mensajesRecibidos, setMensajesRecibidos] = useState([])
  const [mensajesEnviados, setMensajesEnviados] = useState([])

  // Referencias
  const pusherRef = useRef(null)

  // Función para procesar mensajes recibidos
  const procesarMensajeRecibido = (data) => {
    console.log("Mensaje recibido:", data)

    // Registrar mensaje para depuración
    setMensajesRecibidos((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        data: JSON.stringify(data),
        type: "received",
        message: data.message || "Sin mensaje",
      },
      ...prev.slice(0, 19), // Mantener solo los últimos 20 mensajes
    ])

    // Procesar respuestas del dispositivo
    if (data.message && monitoreoActivo) {
      const mensaje = data.message

      // Monitoreo automático de comandos específicos (case sensitive)
      if (mensaje === "releO") {
        setReleActivo(true)
        setUltimaActualizacion(`${new Date().toLocaleTimeString()} - Relé activado (LOW) automáticamente`)
        console.log("Monitoreo: Relé activado por comando releO - digitalWrite(rele, LOW)")
      } else if (mensaje === "releF") {
        setReleActivo(false)
        setUltimaActualizacion(`${new Date().toLocaleTimeString()} - Relé desactivado (HIGH) automáticamente`)
        console.log("Monitoreo: Relé desactivado por comando releF - digitalWrite(rele, HIGH)")
      } else if (mensaje === "ledO") {
        setLedsActivos(true)
        setUltimaActualizacion(
          `${new Date().toLocaleTimeString()} - Todos los LEDs y anillos encendidos automáticamente`,
        )
        console.log("Monitoreo: LEDs activados por comando ledO - led1,led2,led3 HIGH + anillos blancos")
      } else if (mensaje === "ledF") {
        setLedsActivos(false)
        setUltimaActualizacion(`${new Date().toLocaleTimeString()} - Todos los LEDs y anillos apagados automáticamente`)
        console.log("Monitoreo: LEDs desactivados por comando ledF - led1,led2,led3 LOW + anillos OFF")
      }

      // Procesamiento adicional para respuestas del dispositivo (mantener compatibilidad)
      const mensajeLower = mensaje.toLowerCase()
      if (mensajeLower.includes("rele_on") || mensajeLower.includes("relay_on")) {
        setReleActivo(true)
      } else if (mensajeLower.includes("rele_off") || mensajeLower.includes("relay_off")) {
        setReleActivo(false)
      } else if (mensajeLower.includes("led_on") || mensajeLower.includes("leds_on")) {
        setLedsActivos(true)
      } else if (mensajeLower.includes("led_off") || mensajeLower.includes("leds_off")) {
        setLedsActivos(false)
      }
    }
  }

  // Función para enviar comando
  const enviarComando = async (comando, tipo) => {
    try {
      setEnviandoComando(true)

      // Registrar comando enviado
      setMensajesEnviados((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          comando: comando,
          tipo: tipo,
          estado: "enviando",
        },
        ...prev.slice(0, 19),
      ])

      console.log(`Enviando comando: ${comando}`)

      const response = await fetch(`${API_URL}/esp32/comando`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comando: comando,
          userId: "monitoring-user",
        }),
      })

      if (!response.ok) {
        throw new Error(`Error al enviar comando: ${response.status}`)
      }

      // Actualizar estado del comando enviado
      setMensajesEnviados((prev) => prev.map((msg, index) => (index === 0 ? { ...msg, estado: "enviado" } : msg)))

      console.log(`Comando ${comando} enviado exitosamente`)
    } catch (error) {
      console.error("Error al enviar comando:", error)

      // Actualizar estado del comando con error
      setMensajesEnviados((prev) =>
        prev.map((msg, index) => (index === 0 ? { ...msg, estado: "error", error: error.message } : msg)),
      )
    } finally {
      setEnviandoComando(false)
    }
  }

  // Manejar cambio de relé - ENVÍA releO/releF
  const handleReleChange = async (nuevoEstado) => {
    const comando = nuevoEstado ? "releO" : "releF"
    await enviarComando(comando, "relé")
  }

  // Manejar cambio de LEDs - ENVÍA ledO/ledF
  const handleLedsChange = async (nuevoEstado) => {
    const comando = nuevoEstado ? "ledO" : "ledF"
    await enviarComando(comando, "LEDs")
  }

  // Limpiar mensajes de depuración
  const limpiarMensajes = () => {
    setMensajesRecibidos([])
    setMensajesEnviados([])
  }

  // Inicializar Pusher
  useEffect(() => {
    // Inicializar el cliente Pusher
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: true,
    })

    // Eventos de conexión
    pusher.connection.bind("connected", () => {
      setConectado(true)
      setEstadoConexion("Conectado")
      console.log("Pusher conectado")
    })

    pusher.connection.bind("disconnected", () => {
      setConectado(false)
      setEstadoConexion("Desconectado")
      console.log("Pusher desconectado")
    })

    pusher.connection.bind("connecting", () => {
      setEstadoConexion("Conectando...")
      console.log("Pusher conectando...")
    })

    pusher.connection.bind("failed", () => {
      setConectado(false)
      setEstadoConexion("Error de conexión")
      console.log("Pusher falló al conectar")
    })

    // Suscribirse al canal
    const channel = pusher.subscribe(PUSHER_CHANNEL)

    // Escuchar eventos en el canal
    channel.bind(PUSHER_EVENT, procesarMensajeRecibido)
    channel.bind("client-message", procesarMensajeRecibido)

    pusherRef.current = pusher

    // Limpiar al desmontar
    return () => {
      if (pusher) {
        pusher.unsubscribe(PUSHER_CHANNEL)
        pusher.disconnect()
      }
    }
  }, [monitoreoActivo])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3 mb-4">
              <Zap className="h-8 w-8 text-blue-600" />
              Control de Monitoreo
            </h1>
            <div className="flex items-center justify-center gap-4">
              {conectado ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                  <Wifi className="h-4 w-4 mr-1" />
                  {estadoConexion}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                  <WifiOff className="h-4 w-4 mr-1" />
                  {estadoConexion}
                </span>
              )}

              {/* Estado del monitoreo */}
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  monitoreoActivo
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "bg-gray-100 text-gray-800 border border-gray-200"
                }`}
              >
                {monitoreoActivo ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                Monitoreo {monitoreoActivo ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>

        {/* Panel de Monitoreo Automático */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Eye className="h-6 w-6 text-purple-600" />
                Monitoreo Automático
              </h2>
              <button
                onClick={() => setMonitoreoActivo(!monitoreoActivo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  monitoreoActivo ? "bg-purple-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    monitoreoActivo ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Comandos Monitoreados:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    • <code className="bg-gray-200 px-1 rounded font-mono">releO</code> → Activa relé (digitalWrite LOW)
                  </li>
                  <li>
                    • <code className="bg-gray-200 px-1 rounded font-mono">releF</code> → Desactiva relé (digitalWrite
                    HIGH)
                  </li>
                  <li>
                    • <code className="bg-gray-200 px-1 rounded font-mono">ledO</code> → Enciende led1,led2,led3 +
                    anillos blancos
                  </li>
                  <li>
                    • <code className="bg-gray-200 px-1 rounded font-mono">ledF</code> → Apaga led1,led2,led3 + anillos
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Última Actualización:</h4>
                <p className="text-sm text-gray-600">{ultimaActualizacion || "Sin actualizaciones automáticas"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Control de Relé */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Power className="h-6 w-6 text-red-600" />
                Control de Relé
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Estado del Relé</p>
                  <p className="text-sm text-gray-600">{releActivo ? "Activado" : "Desactivado"}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Envía: <code className="bg-gray-200 px-1 rounded font-mono">releO</code> /{" "}
                    <code className="bg-gray-200 px-1 rounded font-mono">releF</code>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${releActivo ? "text-green-600" : "text-gray-500"}`}>
                    {releActivo ? "ON" : "OFF"}
                  </span>
                  <button
                    onClick={() => handleReleChange(!releActivo)}
                    disabled={enviandoComando}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 ${
                      releActivo ? "bg-red-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        releActivo ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleReleChange(true)}
                  disabled={enviandoComando || releActivo}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    releActivo
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  Enviar releO
                </button>
                <button
                  onClick={() => handleReleChange(false)}
                  disabled={enviandoComando || !releActivo}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !releActivo
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  Enviar releF
                </button>
              </div>
            </div>
          </div>

          {/* Control de LEDs */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-yellow-500" />
                Control de LEDs
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Estado de LEDs</p>
                  <p className="text-sm text-gray-600">{ledsActivos ? "Encendidos" : "Apagados"}</p>
                  <p className="text-xs text-gray-500 mt-1">Controla: led1, led2, led3 + anillo1, anillo2, anillo3</p>
                  <p className="text-xs text-gray-500">
                    Envía: <code className="bg-gray-200 px-1 rounded font-mono">ledO</code> /{" "}
                    <code className="bg-gray-200 px-1 rounded font-mono">ledF</code>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${ledsActivos ? "text-yellow-600" : "text-gray-500"}`}>
                    {ledsActivos ? "ON" : "OFF"}
                  </span>
                  <button
                    onClick={() => handleLedsChange(!ledsActivos)}
                    disabled={enviandoComando}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 ${
                      ledsActivos ? "bg-yellow-500" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        ledsActivos ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleLedsChange(true)}
                  disabled={enviandoComando || ledsActivos}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    ledsActivos
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-yellow-500 hover:bg-yellow-600 text-white"
                  }`}
                >
                  Enviar ledO
                </button>
                <button
                  onClick={() => handleLedsChange(false)}
                  disabled={enviandoComando || !ledsActivos}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !ledsActivos
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  Enviar ledF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Depuración */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Bug className="h-6 w-6 text-purple-600" />
                Depuración de Comunicación
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={limpiarMensajes}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Limpiar
                </button>
                <button
                  onClick={() => setDebugMode(!debugMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    debugMode ? "bg-purple-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      debugMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {debugMode && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Mensajes Enviados */}
                <div>
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Comandos Enviados ({mensajesEnviados.length})
                  </h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-h-64 overflow-y-auto">
                    {mensajesEnviados.length === 0 ? (
                      <p className="text-gray-500 text-sm">No hay comandos enviados</p>
                    ) : (
                      <div className="space-y-2">
                        {mensajesEnviados.map((msg, index) => (
                          <div key={index} className="bg-white p-2 rounded border border-green-200">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>{msg.timestamp}</span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  msg.estado === "enviado"
                                    ? "bg-green-100 text-green-800"
                                    : msg.estado === "error"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {msg.estado}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">{msg.tipo}:</span>{" "}
                              <code className="bg-gray-100 px-1 rounded font-mono">{msg.comando}</code>
                            </div>
                            {msg.error && <div className="text-xs text-red-600 mt-1">Error: {msg.error}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mensajes Recibidos */}
                <div>
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Mensajes Recibidos ({mensajesRecibidos.length})
                  </h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-h-64 overflow-y-auto">
                    {mensajesRecibidos.length === 0 ? (
                      <p className="text-gray-500 text-sm">No hay mensajes recibidos</p>
                    ) : (
                      <div className="space-y-2">
                        {mensajesRecibidos.map((msg, index) => (
                          <div key={index} className="bg-white p-2 rounded border border-blue-200">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>{msg.timestamp}</span>
                              <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                                {msg.type}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Mensaje:</span>{" "}
                              <code className="bg-gray-100 px-1 rounded font-mono">{msg.message}</code>
                              {/* Destacar comandos de monitoreo */}
                              {["releO", "releF", "ledO", "ledF"].includes(msg.message) && (
                                <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                  MONITOREO
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 font-mono">{msg.data}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Estado del sistema */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Estado Conexión</p>
              <p className="font-semibold text-gray-800">{estadoConexion}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Monitoreo</p>
              <p className="font-semibold text-gray-800">{monitoreoActivo ? "Activo" : "Inactivo"}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Comandos Enviados</p>
              <p className="font-semibold text-gray-800">{mensajesEnviados.length}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Mensajes Recibidos</p>
              <p className="font-semibold text-gray-800">{mensajesRecibidos.length}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Estado Sistema</p>
              <p className="font-semibold text-gray-800">{conectado ? "Operativo" : "Desconectado"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
