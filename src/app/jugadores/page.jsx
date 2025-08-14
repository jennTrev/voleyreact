"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../componentes/navbar"
import  AppSidebar  from "../componentes/sidebar"
import { SidebarProvider } from "../../components/ui/sidebar"
import {
  UserPlus,
  Edit,
  Trash2,
  X,
  Loader2,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  ExternalLink,
  Users,
} from "lucide-react"

export default function JugadoresPage() {
  const router = useRouter()
  const [jugadores, setJugadores] = useState([])
  const [jugadoresFiltrados, setJugadoresFiltrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [activeTab, setActiveTab] = useState("todos")

  // Estados para el formulario
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState("create")
  const [selectedJugador, setSelectedJugador] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Estado para notificaciones
  const [notification, setNotification] = useState(null)

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    fecha_nacimiento: "",
    carrera: "",
    posicion_principal: "",
    altura: "",
    anos_experiencia_voley: "",
    numero_celular: "",
    correo_institucional: "",
    usuario: "",
    contraseña: "",
  })

  useEffect(() => {
    fetchJugadores()
  }, [])

  useEffect(() => {
    filtrarJugadores()
  }, [busqueda, jugadores, activeTab])

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const filtrarJugadores = () => {
    let filtrados = jugadores

    // Filtrar por tab (basado en género si está disponible en los datos)
    if (activeTab === "varones") {
      filtrados = filtrados.filter((j) => j.genero === "masculino" || j.categoria === "varones")
    } else if (activeTab === "damas") {
      filtrados = filtrados.filter((j) => j.genero === "femenino" || j.categoria === "damas")
    }

    // Filtrar por búsqueda
    if (busqueda.trim() !== "") {
      filtrados = filtrados.filter(
        (jugador) =>
          jugador.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
          jugador.apellidos?.toLowerCase().includes(busqueda.toLowerCase()) ||
          `${jugador.nombres} ${jugador.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
          jugador.correo_institucional?.toLowerCase().includes(busqueda.toLowerCase()) ||
          jugador.carrera?.toLowerCase().includes(busqueda.toLowerCase()) ||
          jugador.cuenta?.usuario?.toLowerCase().includes(busqueda.toLowerCase()),
      )
    }

    setJugadoresFiltrados(filtrados)
    setCurrentPage(1)
  }

  const fetchJugadores = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      
      const response = await fetch("/api/jugadores", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al cargar jugadores")
      }

      if (data.success) {
        setJugadores(data.data)
        setJugadoresFiltrados(data.data)
        setError("")
      } else {
        throw new Error(data.message || "Error al cargar jugadores")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Error al cargar los jugadores. Intente nuevamente.")
      if (error.message.includes("401") || error.message.includes("token")) {
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleOpenCreateForm = () => {
    setFormData({
      nombres: "",
      apellidos: "",
      fecha_nacimiento: "",
      carrera: "",
      posicion_principal: "",
      altura: "",
      anos_experiencia_voley: "",
      numero_celular: "",
      correo_institucional: "",
      usuario: "",
      contraseña: "",
    })
    setFormMode("create")
    setShowForm(true)
  }

  const handleViewJugador = (jugador) => {
    setSelectedJugador(jugador)
    setFormData({
      nombres: jugador.nombres || "",
      apellidos: jugador.apellidos || "",
      fecha_nacimiento: jugador.fecha_nacimiento ? jugador.fecha_nacimiento.split("T")[0] : "",
      carrera: jugador.carrera || "",
      posicion_principal: jugador.posicion_principal || "",
      altura: jugador.altura || "",
      anos_experiencia_voley: jugador.anos_experiencia_voley || "",
      numero_celular: jugador.numero_celular || "",
      correo_institucional: jugador.correo_institucional || "",
      usuario: jugador.cuenta?.usuario || "",
      contraseña: "",
    })
    setFormMode("view")
    setShowForm(true)
  }

  const handleOpenEditForm = (jugador) => {
    setSelectedJugador(jugador)
    setFormData({
      nombres: jugador.nombres || "",
      apellidos: jugador.apellidos || "",
      fecha_nacimiento: jugador.fecha_nacimiento ? jugador.fecha_nacimiento.split("T")[0] : "",
      carrera: jugador.carrera || "",
      posicion_principal: jugador.posicion_principal || "",
      altura: jugador.altura || "",
      anos_experiencia_voley: jugador.anos_experiencia_voley || "",
      numero_celular: jugador.numero_celular || "",
      correo_institucional: jugador.correo_institucional || "",
      usuario: jugador.cuenta?.usuario || "",
      contraseña: "",
    })
    setFormMode("update")
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        router.push("/login")
        return
      }

      const url = formMode === "create" ? "/api/jugadores" : `/api/jugadores/${selectedJugador.id}`
      const method = formMode === "create" ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al procesar la solicitud")
      }

      if (data.success) {
        showNotification(
          "success",
          formMode === "create" ? "Jugador creado exitosamente" : "Jugador actualizado exitosamente",
        )
        setShowForm(false)
        setSelectedJugador(null)
        await fetchJugadores()
      } else {
        throw new Error(data.message || "Error al procesar la solicitud")
      }
    } catch (error) {
      console.error("Error:", error)
      setError(error.message || "Error al procesar la solicitud")
      showNotification("error", error.message || "Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJugador = (jugador) => {
    setSelectedJugador(jugador)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`/api/jugadores/${selectedJugador.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar jugador")
      }

      if (data.success) {
        showNotification("success", "Jugador eliminado exitosamente")
        setShowDeleteModal(false)
        await fetchJugadores()
        setError("")
      } else {
        throw new Error(data.message || "Error al eliminar jugador")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Error al eliminar el jugador. Intente nuevamente.")
      showNotification("error", "Error al eliminar el jugador")
    } finally {
      setLoading(false)
    }
  }

  // Lógica de paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = jugadoresFiltrados.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(jugadoresFiltrados.length / itemsPerPage)

  const totalJugadores = jugadoresFiltrados.length
  const activeJugadores = jugadoresFiltrados.filter((j) => j.cuenta?.activo === true).length
  const varonesCount = jugadores.filter((j) => j.genero === "masculino" || j.categoria === "varones").length
  const damasCount = jugadores.filter((j) => j.genero === "femenino" || j.categoria === "damas").length

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <Navbar />

        {/* Sidebar */}
        <AppSidebar />

        {/* Notificación emergente */}
        {notification && (
          <div className="fixed top-20 right-6 z-50 animate-fade-in">
            <div
              className={`rounded-xl shadow-lg p-4 flex items-center min-w-80 ${
                notification.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
              )}
              <span
                className={`font-medium text-sm ${notification.type === "success" ? "text-green-800" : "text-red-800"}`}
              >
                {notification.message}
              </span>
              <button
                onClick={() => setNotification(null)}
                className={`ml-4 ${notification.type === "success" ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="lg:ml-64 pt-16">
          <div className="p-4 lg:p-6">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Jugadores</h1>
                  <p className="text-gray-600 text-sm">Gestiona los jugadores de la selección de volleyball</p>
                </div>
                <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                  <div className="text-right text-sm">
                    <p className="font-semibold text-gray-900">Total jugadores: {totalJugadores}</p>
                    <p className="text-gray-500">
                      Varones: {varonesCount} | Damas: {damasCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("todos")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "todos"
                        ? "border-red-900 text-red-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Todos ({jugadores.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("varones")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "varones"
                        ? "border-red-900 text-red-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Varones ({varonesCount})
                  </button>
                  <button
                    onClick={() => setActiveTab("damas")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "damas"
                        ? "border-red-900 text-red-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Damas ({damasCount})
                  </button>
                </nav>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar jugadores por nombre, email, carrera o usuario..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleOpenCreateForm}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors font-medium"
                  disabled={loading}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Agregar nuevo</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  <Download className="h-4 w-4" />
                  <span>Importar jugadores</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  <ExternalLink className="h-4 w-4" />
                  <span>Exportar jugadores (Excel)</span>
                </button>
              </div>
              <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                <Filter className="h-4 w-4" />
                <span>Filtrar</span>
              </button>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {loading && !showForm && !showDeleteModal ? (
                <div className="p-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-red-900 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Cargando jugadores...</p>
                </div>
              ) : jugadoresFiltrados.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {busqueda ? "No se encontraron jugadores" : "No hay jugadores registrados"}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {busqueda
                      ? "Intenta con otros términos de búsqueda."
                      : "Comienza agregando tu primer jugador al sistema."}
                  </p>
                  {!busqueda && (
                    <button
                      onClick={handleOpenCreateForm}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors font-medium mx-auto"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Agregar primer jugador</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="col-span-3">Foto</div>
                      <div className="col-span-2">Usuario</div>
                      <div className="col-span-2">Carrera</div>
                      <div className="col-span-1">Edad</div>
                      <div className="col-span-1">Móvil</div>
                      <div className="col-span-1">Estado</div>
                      <div className="col-span-1">Operación</div>
                      <div className="col-span-1">Acción</div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200">
                    {currentItems.map((jugador) => (
                      <div key={jugador.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Photo */}
                          <div className="col-span-3">
                            <div className="flex items-center">
                              <img
                                src={jugador.photo || "/placeholder.svg?height=40&width=40"}
                                alt={`${jugador.nombres} ${jugador.apellidos}`}
                                className="w-10 h-10 rounded-full object-cover mr-3"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {jugador.nombres} {jugador.apellidos}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{jugador.posicion_principal}</p>
                              </div>
                            </div>
                          </div>

                          {/* Usuario */}
                          <div className="col-span-2">
                            <p className="text-sm text-gray-900">{jugador.cuenta?.usuario}</p>
                          </div>

                          {/* Carrera */}
                          <div className="col-span-2">
                            <p className="text-sm text-gray-900 truncate">{jugador.carrera}</p>
                          </div>

                          {/* Edad */}
                          <div className="col-span-1">
                            <p className="text-sm text-gray-900">{jugador.edad} años</p>
                          </div>

                          {/* Mobile */}
                          <div className="col-span-1">
                            <p className="text-sm text-gray-900">{jugador.numero_celular}</p>
                          </div>

                          {/* Status */}
                          <div className="col-span-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                jugador.cuenta?.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {jugador.cuenta?.activo ? "Activo" : "Inactivo"}
                            </span>
                          </div>

                          {/* Operation */}
                          <div className="col-span-1">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleViewJugador(jugador)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditForm(jugador)}
                                className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteJugador(jugador)}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Action */}
                          <div className="col-span-1">
                            <button className="px-3 py-1 bg-red-900 text-white text-xs rounded hover:bg-red-800 transition-colors">
                              Login
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, jugadoresFiltrados.length)} de{" "}
                          {jugadoresFiltrados.length} jugadores
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-2 rounded-lg text-sm font-medium ${
                              currentPage === 1
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>

                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let page
                              if (totalPages <= 5) {
                                page = i + 1
                              } else if (currentPage <= 3) {
                                page = i + 1
                              } else if (currentPage >= totalPages - 2) {
                                page = totalPages - 4 + i
                              } else {
                                page = currentPage - 2 + i
                              }

                              return (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                    currentPage === page
                                      ? "bg-red-900 text-white"
                                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                  }`}
                                >
                                  {page}
                                </button>
                              )
                            })}
                          </div>

                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-2 rounded-lg text-sm font-medium ${
                              currentPage === totalPages
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal para crear/editar/ver jugador */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {formMode === "create" && "Agregar Nuevo Jugador"}
                  {formMode === "update" && "Editar Jugador"}
                  {formMode === "view" && "Detalles del Jugador"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombres */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombres *</label>
                    <input
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleInputChange}
                      disabled={formMode === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 disabled:bg-gray-50"
                      required
                    />
                  </div>

                  {/* Apellidos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos *</label>
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleInputChange}
                      disabled={formMode === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 disabled:bg-gray-50"
                      required
                    />
                  </div>

                  {/* Fecha de Nacimiento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento *</label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleInputChange}
                      disabled={formMode === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 disabled:bg-gray-50"
                      required
                    />
                  </div>

                  {/* Posición Principal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Posición Principal *</label>
                    <select
                      name="posicion_principal"
                      value={formData.posicion_principal}
                      onChange={handleInputChange}
                      disabled={formMode === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 disabled:bg-gray-50"
                      required
                    >
                      <option value="">Seleccionar posición</option>
                      <option value="Armador">Armador</option>
                      <option value="Opuesto">Opuesto</option>
                      <option value="Central">Central</option>
                      <option value="Receptor">Receptor</option>
                      <option value="Líbero">Líbero</option>
                    </select>
                  </div>

                  {/* Carrera */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Carrera *</label>
                    <input
                      type="text"
                      name="carrera"
                      value={formData.carrera}
                      onChange={handleInputChange}
                      disabled={formMode === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 disabled:bg-gray-50"
                      required
                    />
                  </div>

                  {/* Altura */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Altura (cm) *</label>
                    <input
                      type="number"
                      name="altura"
                      value={formData.altura}
                      onChange={handleInputChange}
                      disabled={formMode === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 disabled:bg-gray-50"
                      required
                      min="150"
                      max="220"
                    />
                  </div>

                  {/* Años de Experiencia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Años de Experiencia *</label>
                    <input
                      type="number"
                      name="anos_experiencia_voley"
                      value={formData.anos_experiencia_voley}
                      onChange={handleInputChange}
                      disabled={formMode === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 disabled:bg-gray-50"
                      required
                      min="0"
                      max="20"
                    />
                  </div>

                  {/* Número de celular */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de celular *</label>
                    <input
                      type="tel"
                      name="numero_celular"
                      value={formData.numero_celular}
                      onChange={handleInputChange}
                      disabled={formMode === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 disabled:bg-gray-50"
                      required
                    />
                  </div>

                  {/* Correo institucional */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correo institucional *</label>
                    <input
                      type="email"
                      name="correo_institucional"
                      value={formData.correo_institucional}
                      onChange={handleInputChange}
                      disabled={formMode === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 disabled:bg-gray-50"
                      required
                    />
                  </div>

                  {/* Usuario */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usuario *</label>
                    <input
                      type="text"
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleInputChange}
                      disabled={formMode === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900"
                      required
                    />
                  </div>

                  {/* Contraseña */}
                  {formMode !== "view" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formMode === "create" ? "Contraseña *" : "Nueva contraseña (opcional)"}
                      </label>
                      <input
                        type="password"
                        name="contraseña"
                        value={formData.contraseña}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900"
                        required={formMode === "create"}
                      />
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    {formMode === "view" ? "Cerrar" : "Cancelar"}
                  </button>
                  {formMode !== "view" && (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>{formMode === "create" ? "Crear jugador" : "Actualizar jugador"}</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && selectedJugador && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Confirmar eliminación</h3>
                <p className="text-gray-600 text-center mb-6">
                  ¿Estás seguro de que deseas eliminar al jugador{" "}
                  <span className="font-semibold">
                    {selectedJugador.nombres} {selectedJugador.apellidos}
                  </span>
                  ? Esta acción no se puede deshacer.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={loading}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  )
}
