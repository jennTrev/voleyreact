"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../componentes/navbar"
import {
  UserPlus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  Users,
  User,
  Mail,
  Key,
  Calendar,
  Ruler,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

// URL de la API
const API_URL = "https://jenn.onrender.com"

export default function UsuariosPage() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Estados para el formulario
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState("create") // create, update o view
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Estado para notificaciones
  const [notification, setNotification] = useState(null)

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(8)

  // Lista de carreras ordenadas alfabéticamente
  const carreras = [
    "Admin. Empresas",
    "Arquitectura",
    "Derecho",
    "Diseño gráfico",
    "Fisioterapía",
    "Gastronomía",
    "Ing. Biomédica",
    "Ing. Electrónica",
    "Ing. Financiera",
    "Ing. Mecatrónica",
    "Ing. Sistemas",
    "Medicina",
    "Odontologia",
  ]

  // Estado para el formulario de usuario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    user: "",
    contrasena: "",
    rol: "jugador",
    correo: "",
    altura: "",
    posicion: "",
    fecha_nacimiento: "",
    carrera: "",
  })

  // Mostrar notificación
  const showNotification = (type, message) => {
    setNotification({ type, message })
    // Auto-cerrar después de 3 segundos
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  // Cargar usuarios al iniciar
  useEffect(() => {
    fetchUsuarios()
  }, [])

  // Obtener todos los usuarios
  const fetchUsuarios = async () => {
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
      setUsuarios(data)
      setError("")
    } catch (error) {
      console.error("Error:", error)
      setError("Error al cargar los usuarios. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Abrir formulario para crear usuario
  const handleOpenCreateForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      user: "",
      contrasena: "",
      rol: "jugador",
      correo: "",
      altura: "",
      posicion: "",
      fecha_nacimiento: "",
      carrera: "",
    })
    setFormMode("create")
    setShowForm(true)
  }

  // Abrir formulario para ver usuario
  const handleViewUser = (user) => {
    setSelectedUser(user)

    // Formatear fecha para el input date
    let formattedDate = ""
    if (user.fecha_nacimiento) {
      formattedDate = new Date(user.fecha_nacimiento).toISOString().split("T")[0]
    }

    setFormData({
      nombre: user.nombre || "",
      apellido: user.apellido || "",
      user: user.user || "",
      contrasena: user.contrasena || "",
      rol: user.rol || "jugador",
      correo: user.correo || "",
      altura: user.altura || "",
      posicion: user.posicion || "",
      fecha_nacimiento: formattedDate,
      carrera: user.carrera || "",
    })

    setFormMode("view")
    setShowForm(true)
  }

  // Abrir formulario para editar usuario
  const handleOpenEditForm = async (id) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener el usuario")
      }

      const userData = await response.json()
      setSelectedUser(userData)

      // Formatear fecha para el input date
      let formattedDate = ""
      if (userData.fecha_nacimiento) {
        formattedDate = new Date(userData.fecha_nacimiento).toISOString().split("T")[0]
      }

      setFormData({
        nombre: userData.nombre || "",
        apellido: userData.apellido || "",
        user: userData.user || "",
        contrasena: "", // Vacío para no mostrar la contraseña actual
        rol: userData.rol || "jugador",
        correo: userData.correo || "",
        altura: userData.altura || "",
        posicion: userData.posicion || "",
        fecha_nacimiento: formattedDate,
        carrera: userData.carrera || "",
      })

      setFormMode("update")
      setShowForm(true)
    } catch (error) {
      console.error("Error:", error)
      setError("Error al cargar los datos del usuario. Intente nuevamente.")
      showNotification("error", "Error al cargar los datos del usuario")
    } finally {
      setLoading(false)
    }
  }

  // Crear o actualizar usuario
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Preparar datos según el modo
      const userData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        user: formData.user,
        correo: formData.correo,
        rol: "jugador", // Siempre jugador por defecto
      }

      // Agregar contraseña solo si se proporciona
      if (formData.contrasena) {
        userData.contrasena = formData.contrasena
      }

      // Agregar campos adicionales para jugadores
      if (userData.rol === "jugador") {
        userData.altura = Number.parseFloat(formData.altura) || null
        userData.posicion = formData.posicion
        userData.fecha_nacimiento = formData.fecha_nacimiento
        userData.carrera = formData.carrera
      }

      let response

      if (formMode === "create") {
        // Crear nuevo usuario
        response = await fetch(`${API_URL}/usuarios`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(userData),
        })
      } else {
        // Actualizar usuario existente
        response = await fetch(`${API_URL}/usuarios/${selectedUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(userData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error en la operación")
      }

      // Recargar la lista de usuarios
      await fetchUsuarios()

      // Mostrar notificación de éxito
      showNotification(
        "success",
        formMode === "create" ? "Usuario creado exitosamente" : "Usuario actualizado exitosamente",
      )

      // Cerrar formulario
      setShowForm(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Error:", error)
      setError(error.message || "Error al procesar la solicitud")
      showNotification("error", error.message || "Error al procesar la solicitud")
    } finally {
      setLoading(false)
    }
  }

  // Abrir modal de confirmación para eliminar usuario
  const handleDeleteUser = (user) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  // Eliminar usuario
  const handleDeleteConfirm = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/usuarios/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el usuario")
      }

      // Recargar la lista de usuarios
      await fetchUsuarios()
      setError("")

      // Mostrar notificación de éxito
      showNotification("success", "Usuario eliminado exitosamente")

      // Cerrar modal de confirmación
      setShowDeleteModal(false)
    } catch (error) {
      console.error("Error:", error)
      setError("Error al eliminar el usuario. Intente nuevamente.")
      showNotification("error", "Error al eliminar el usuario")
    } finally {
      setLoading(false)
    }
  }

  // Lógica de paginación
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = usuarios.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(usuarios.length / usersPerPage)

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Ir a la página anterior
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Ir a la página siguiente
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Notificación emergente */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div
            className={`rounded-lg shadow-lg p-4 flex items-center ${
              notification.type === "success"
                ? "bg-green-100 border-l-4 border-green-500"
                : "bg-red-100 border-l-4 border-red-500"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            )}
            <span className="text-black font-medium">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-4 text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-black flex items-center">
            <Users className="mr-2 h-8 w-8 text-[#1E3A8A]" />
            JUGARORES
          </h1>

          {/* Botón para crear nuevo usuario */}
          <button
            onClick={handleOpenCreateForm}
            className="bg-[#1E3A8A] text-white px-4 py-2 rounded hover:bg-[#152a61] transition-colors flex items-center"
            disabled={loading}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Crear Nuevo Usuario
          </button>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
            <X className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Tabla de usuarios */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {loading && !showForm && !showDeleteModal ? (
            <div className="p-4 text-center flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#1E3A8A] mr-2" />
              <span className="text-black">Cargando usuarios...</span>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="p-4 text-center text-black">No hay usuarios registrados</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Correo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-black">
                        {usuario.nombre} {usuario.apellido}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-black">{usuario.user}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-black">{usuario.correo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            usuario.rol === "jugador"
                              ? "bg-green-100 text-green-800"
                              : usuario.rol === "entrenador"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {usuario.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewUser(usuario)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            disabled={loading}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </button>
                          <button
                            onClick={() => handleOpenEditForm(usuario.id)}
                            className="text-[#1E3A8A] hover:text-[#152a61] flex items-center"
                            disabled={loading}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteUser(usuario)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        {usuarios.length > 0 && (
          <div className="flex justify-between items-center mt-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-1 rounded ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </button>

            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>

              <div className="mx-4 flex space-x-1">
                {[...Array(totalPages).keys()].map((number) => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${
                      currentPage === number + 1
                        ? "bg-[#1E3A8A] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-1 rounded ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Modal para crear/editar/ver usuario */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4 border-gray-400">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-black flex items-center">
                {formMode === "create" ? (
                  <>
                    <UserPlus className="mr-2 h-6 w-6 text-[#1E3A8A]" />
                    Crear Nuevo Jugador
                  </>
                ) : formMode === "update" ? (
                  <>
                    <Edit className="mr-2 h-6 w-6 text-[#1E3A8A]" />
                    Editar Jugador
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-6 w-6 text-[#1E3A8A]" />
                    Detalles del Jugador
                  </>
                )}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setSelectedUser(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {formMode === "view" ? (
              // Vista de detalles (solo lectura)
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nombre</p>
                    <p className="text-black font-medium">{formData.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Apellido</p>
                    <p className="text-black font-medium">{formData.apellido}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Usuario</p>
                    <p className="text-black font-medium">{formData.user}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Correo</p>
                    <p className="text-black font-medium">{formData.correo}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Rol</p>
                  <p className="text-black font-medium">{formData.rol}</p>
                </div>

                {formData.rol === "jugador" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Altura</p>
                        <p className="text-black font-medium">{formData.altura || "No especificada"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Posición</p>
                        <p className="text-black font-medium">{formData.posicion || "No especificada"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Fecha de Nacimiento</p>
                        <p className="text-black font-medium">{formData.fecha_nacimiento || "No especificada"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Carrera</p>
                        <p className="text-black font-medium">{formData.carrera || "No especificada"}</p>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setSelectedUser(null)
                    }}
                    className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 flex items-center"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              // Formulario para crear o editar (campos editables)
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  {/* Campos comunes para todos los roles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-black font-medium mb-1 flex items-center">
                        <User className="mr-2 h-4 w-4 text-[#1E3A8A]" />
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-black font-medium mb-1 flex items-center">
                        <User className="mr-2 h-4 w-4 text-[#1E3A8A]" />
                        Apellido
                      </label>
                      <input
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-black"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-black font-medium mb-1 flex items-center">
                        <User className="mr-2 h-4 w-4 text-[#1E3A8A]" />
                        Usuario
                      </label>
                      <input
                        type="text"
                        name="user"
                        value={formData.user}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-black font-medium mb-1 flex items-center">
                        <Key className="mr-2 h-4 w-4 text-[#1E3A8A]" />
                        Contraseña
                      </label>
                      <input
                        type="password"
                        name="contrasena"
                        value={formData.contrasena}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-black"
                        required={formMode === "create"}
                        placeholder={formMode === "update" ? "Dejar en blanco para mantener la actual" : ""}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-black font-medium mb-1 flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-[#1E3A8A]" />
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded text-black"
                      required
                    />
                  </div>

                  {/* Campos adicionales para jugadores (siempre visibles ya que el rol es jugador por defecto) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-black font-medium mb-1 flex items-center">
                        <Ruler className="mr-2 h-4 w-4 text-[#1E3A8A]" />
                        Altura (metros)
                      </label>
                      <input
                        type="number"
                        name="altura"
                        value={formData.altura}
                        onChange={handleInputChange}
                        step="0.01"
                        className="w-full p-2 border border-gray-300 rounded text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-black font-medium mb-1">Posición</label>
                      <select
                        name="posicion"
                        value={formData.posicion}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-black"
                      >
                        <option value="">Selecciona una posición</option>
                        <option value="punta">Punta</option>
                        <option value="central">Central</option>
                        <option value="armador">Armador</option>
                        <option value="opuesto">Opuesto</option>
                        <option value="libero">Líbero</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-black font-medium mb-1 flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-[#1E3A8A]" />
                        Fecha de Nacimiento
                      </label>
                      <input
                        type="date"
                        name="fecha_nacimiento"
                        value={formData.fecha_nacimiento}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-black font-medium mb-1 flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4 text-[#1E3A8A]" />
                        Carrera
                      </label>
                      <select
                        name="carrera"
                        value={formData.carrera}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded text-black"
                      >
                        <option value="">Selecciona una carrera</option>
                        {carreras.map((carrera) => (
                          <option key={carrera} value={carrera}>
                            {carrera}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setSelectedUser(null)
                      }}
                      className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 flex items-center"
                      disabled={loading}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1E3A8A] text-white rounded hover:bg-[#152a61] flex items-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {formMode === "create" ? "Crear Usuario" : "Actualizar Usuario"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar usuario */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg w-full max-w-md border-4 border-gray-400">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-black flex items-center">
                <Trash2 className="mr-2 h-6 w-6 text-red-500" />
                Confirmar Eliminación
              </h2>
              <p className="text-gray-700 mt-2">
                ¿Está seguro que desea eliminar al usuario "{selectedUser?.nombre} {selectedUser?.apellido}"?
              </p>
              <p className="text-gray-500 text-sm mt-1">Esta acción no se puede deshacer.</p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 flex items-center"
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
