"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "../componentes/navbar"
import { AppSidebar } from "../componentes/sidebar"
import { SidebarProvider } from "../../components/ui/sidebar"
import {
  UserPlus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  UserCheck,
  User,
  Mail,
  Phone,
  Calendar,
  Trophy,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  ExternalLink,
} from "lucide-react"

export default function EntrenadoresPage() {
  const router = useRouter()
  const [entrenadores, setEntrenadores] = useState([])
  const [entrenadoresFiltrados, setEntrenadoresFiltrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [activeTab, setActiveTab] = useState("entrenadores")

  // Estados para el formulario
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState("create")
  const [selectedEntrenador, setSelectedEntrenador] = useState(null)
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
    edad: "",
    anos_experiencia_voley: "",
    numero_celular: "",
    correo_electronico: "",
    usuario: "",
    contraseña: "",
  })

  useEffect(() => {
    fetchEntrenadores()
  }, [])

  useEffect(() => {
    filtrarEntrenadores()
  }, [busqueda, entrenadores])

  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  const filtrarEntrenadores = () => {
    if (busqueda.trim() === "") {
      setEntrenadoresFiltrados(entrenadores)
    } else {
      const filtrados = entrenadores.filter(
        (entrenador) =>
          entrenador.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
          entrenador.apellidos?.toLowerCase().includes(busqueda.toLowerCase()) ||
          `${entrenador.nombres} ${entrenador.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
          entrenador.correo_electronico?.toLowerCase().includes(busqueda.toLowerCase()) ||
          entrenador.cuenta?.usuario?.toLowerCase().includes(busqueda.toLowerCase()),
      )
      setEntrenadoresFiltrados(filtrados)
    }
    setCurrentPage(1)
  }

  const fetchEntrenadores = async () => {
    try {
      setLoading(true)
      // Datos simulados para preview
      const staticData = [
        {
          id: 1,
          nombres: "Ana",
          apellidos: "Martinez",
          edad: 32,
          anos_experiencia_voley: 8,
          numero_celular: "+591 70456789",
          correo_electronico: "ana.martinez@universidad.edu",
          cuenta: { id: 1, usuario: "ana.martinez" },
          status: "active",
          photo: "/placeholder.svg?height=40&width=40",
        },
        {
          id: 2,
          nombres: "Roberto",
          apellidos: "Silva",
          edad: 45,
          anos_experiencia_voley: 15,
          numero_celular: "+591 70567890",
          correo_electronico: "roberto.silva@universidad.edu",
          cuenta: { id: 2, usuario: "roberto.silva" },
          status: "active",
          photo: "/placeholder.svg?height=40&width=40",
        },
        {
          id: 3,
          nombres: "Patricia",
          apellidos: "Gonzalez",
          edad: 38,
          anos_experiencia_voley: 12,
          numero_celular: "+591 70678901",
          correo_electronico: "patricia.gonzalez@universidad.edu",
          cuenta: { id: 3, usuario: "patricia.gonzalez" },
          status: "active",
          photo: "/placeholder.svg?height=40&width=40",
        },
      ]

      setEntrenadores(staticData)
      setEntrenadoresFiltrados(staticData)
      setError("")
    } catch (error) {
      console.error("Error:", error)
      setError("Error al cargar los entrenadores. Intente nuevamente.")
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
      edad: "",
      anos_experiencia_voley: "",
      numero_celular: "",
      correo_electronico: "",
      usuario: "",
      contraseña: "",
    })
    setFormMode("create")
    setShowForm(true)
  }

  const handleViewEntrenador = (entrenador) => {
    setSelectedEntrenador(entrenador)
    setFormData({
      nombres: entrenador.nombres || "",
      apellidos: entrenador.apellidos || "",
      edad: entrenador.edad || "",
      anos_experiencia_voley: entrenador.anos_experiencia_voley || "",
      numero_celular: entrenador.numero_celular || "",
      correo_electronico: entrenador.correo_electronico || "",
      usuario: entrenador.cuenta?.usuario || "",
      contraseña: "",
    })
    setFormMode("view")
    setShowForm(true)
  }

  const handleOpenEditForm = (entrenador) => {
    setSelectedEntrenador(entrenador)
    setFormData({
      nombres: entrenador.nombres || "",
      apellidos: entrenador.apellidos || "",
      edad: entrenador.edad || "",
      anos_experiencia_voley: entrenador.anos_experiencia_voley || "",
      numero_celular: entrenador.numero_celular || "",
      correo_electronico: entrenador.correo_electronico || "",
      usuario: entrenador.cuenta?.usuario || "",
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
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      showNotification(
        "success",
        formMode === "create" ? "Entrenador creado exitosamente" : "Entrenador actualizado exitosamente",
      )
      setShowForm(false)
      setSelectedEntrenador(null)

      // Refresh data
      await fetchEntrenadores()
    } catch (error) {
      console.error("Error:", error)
      setError(error.message || "Error al procesar la solicitud")
      showNotification("error", error.message || "Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEntrenador = (entrenador) => {
    setSelectedEntrenador(entrenador)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true)
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      showNotification("success", "Entrenador eliminado exitosamente")
      setShowDeleteModal(false)

      // Refresh data
      await fetchEntrenadores()
      setError("")
    } catch (error) {
      console.error("Error:", error)
      setError("Error al eliminar el entrenador. Intente nuevamente.")
      showNotification("error", "Error al eliminar el entrenador")
    } finally {
      setLoading(false)
    }
  }

  // Lógica de paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = entrenadoresFiltrados.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(entrenadoresFiltrados.length / itemsPerPage)

  const totalEntrenadores = entrenadoresFiltrados.length
  const activeEntrenadores = entrenadoresFiltrados.filter((e) => e.status === "active").length

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
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Entrenadores</h1>
                  <p className="text-gray-600 text-sm">Gestiona los entrenadores del sistema de volleyball</p>
                </div>
                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                  <div className="text-right text-sm">
                    <p className="font-semibold text-gray-900">Total entrenadores: {totalEntrenadores}</p>
                    <p className="text-gray-500">Activos: {activeEntrenadores}</p>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar entrenadores por nombre, email o usuario..."
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
                  <span>Importar entrenadores</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  <ExternalLink className="h-4 w-4" />
                  <span>Exportar entrenadores (Excel)</span>
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
                  <p className="text-gray-600 font-medium">Cargando entrenadores...</p>
                </div>
              ) : entrenadoresFiltrados.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {busqueda ? "No se encontraron entrenadores" : "No hay entrenadores registrados"}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {busqueda
                      ? "Intenta con otros términos de búsqueda."
                      : "Comienza agregando tu primer entrenador al sistema."}
                  </p>
                  {!busqueda && (
                    <button
                      onClick={handleOpenCreateForm}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors font-medium mx-auto"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Agregar primer entrenador</span>
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="col-span-3">Foto</div>
                      <div className="col-span-2">Nombre del entrenador</div>
                      <div className="col-span-2">Móvil</div>
                      <div className="col-span-2">Email</div>
                      <div className="col-span-1">Estado</div>
                      <div className="col-span-1">Operación</div>
                      <div className="col-span-1">Acción</div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200">
                    {currentItems.map((entrenador) => (
                      <div key={entrenador.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Photo */}
                          <div className="col-span-3">
                            <div className="flex items-center">
                              <img
                                src={entrenador.photo || "/placeholder.svg"}
                                alt={`${entrenador.nombres} ${entrenador.apellidos}`}
                                className="w-10 h-10 rounded-full object-cover mr-3"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {entrenador.nombres} {entrenador.apellidos}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Name */}
                          <div className="col-span-2">
                            <p className="text-sm text-gray-900">{entrenador.cuenta?.usuario}</p>
                          </div>

                          {/* Mobile */}
                          <div className="col-span-2">
                            <p className="text-sm text-gray-900">{entrenador.numero_celular}</p>
                          </div>

                          {/* Email */}
                          <div className="col-span-2">
                            <p className="text-sm text-gray-900 truncate">{entrenador.correo_electronico}</p>
                          </div>

                          {/* Status */}
                          <div className="col-span-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                entrenador.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {entrenador.status === "active" ? "Activo" : "Inactivo"}
                            </span>
                          </div>

                          {/* Operation */}
                          <div className="col-span-1">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleViewEntrenador(entrenador)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditForm(entrenador)}
                                className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEntrenador(entrenador)}
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
                          Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, entrenadoresFiltrados.length)}{" "}
                          de {entrenadoresFiltrados.length} entrenadores
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

        {/* Modal para crear/editar/ver entrenador */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-red-900 to-red-800 px-6 py-4 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    {formMode === "create" ? (
                      <>
                        <UserPlus className="mr-3 h-5 w-5" />
                        Crear Nuevo Entrenador
                      </>
                    ) : formMode === "update" ? (
                      <>
                        <Edit className="mr-3 h-5 w-5" />
                        Editar Entrenador
                      </>
                    ) : (
                      <>
                        <Eye className="mr-3 h-5 w-5" />
                        Detalles del Entrenador
                      </>
                    )}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setSelectedEntrenador(null)
                    }}
                    className="text-red-200 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {formMode === "view" ? (
                  // Vista de detalles (solo lectura)
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombres</label>
                        <p className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg">{formData.nombres}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                        <p className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                          {formData.apellidos}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                        <p className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg">{formData.usuario}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
                        <p className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                          {formData.edad} años
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                        <p className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                          {formData.correo_electronico}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Número de Celular</label>
                        <p className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                          {formData.numero_celular}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Años de Experiencia en Vóley
                      </label>
                      <p className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                        {formData.anos_experiencia_voley} años
                      </p>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setShowForm(false)
                          setSelectedEntrenador(null)
                        }}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Formulario para crear o editar
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="inline h-4 w-4 mr-2 text-red-900" />
                          Nombres
                        </label>
                        <input
                          type="text"
                          name="nombres"
                          value={formData.nombres}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="inline h-4 w-4 mr-2 text-red-900" />
                          Apellidos
                        </label>
                        <input
                          type="text"
                          name="apellidos"
                          value={formData.apellidos}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <User className="inline h-4 w-4 mr-2 text-red-900" />
                          Usuario
                        </label>
                        <input
                          type="text"
                          name="usuario"
                          value={formData.usuario}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="inline h-4 w-4 mr-2 text-red-900" />
                          Edad
                        </label>
                        <input
                          type="number"
                          name="edad"
                          value={formData.edad}
                          onChange={handleInputChange}
                          min="25"
                          max="70"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="inline h-4 w-4 mr-2 text-red-900" />
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          name="correo_electronico"
                          value={formData.correo_electronico}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="inline h-4 w-4 mr-2 text-red-900" />
                          Número de Celular
                        </label>
                        <input
                          type="tel"
                          name="numero_celular"
                          value={formData.numero_celular}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Trophy className="inline h-4 w-4 mr-2 text-red-900" />
                          Años de Experiencia en Vóley
                        </label>
                        <input
                          type="number"
                          name="anos_experiencia_voley"
                          value={formData.anos_experiencia_voley}
                          onChange={handleInputChange}
                          min="1"
                          max="40"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                        <input
                          type="password"
                          name="contraseña"
                          value={formData.contraseña}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900"
                          required={formMode === "create"}
                          placeholder={formMode === "update" ? "Dejar en blanco para mantener la actual" : ""}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false)
                          setSelectedEntrenador(null)
                        }}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                        disabled={loading}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex items-center space-x-2 px-6 py-2.5 bg-red-900 text-white rounded-lg hover:bg-red-800 font-medium transition-colors"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Procesando...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>{formMode === "create" ? "Crear Entrenador" : "Actualizar Entrenador"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación para eliminar */}
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
                    <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-6">
                  ¿Está seguro que desea eliminar al entrenador{" "}
                  <strong>
                    "{selectedEntrenador?.nombres} {selectedEntrenador?.apellidos}"
                  </strong>
                  ?
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center space-x-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Eliminando...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        <span>Eliminar</span>
                      </>
                    )}
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
