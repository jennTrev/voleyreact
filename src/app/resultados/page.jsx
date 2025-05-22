"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../componentes/navbar"
import {
  Edit,
  Trash2,
  X,
  Loader2,
  Search,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Save,
} from "lucide-react"

// URL de la API
const API_URL = "https://jenn.onrender.com"

export default function PruebasPage() {
  const router = useRouter()
  const [pruebasSalto, setPruebasSalto] = useState([])
  const [pruebasReaccion, setPruebasReaccion] = useState([])
  const [usuarios, setUsuarios] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busqueda, setBusqueda] = useState("")

  // Estados para el formulario
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState("update") // update o view
  const [selectedPrueba, setSelectedPrueba] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Estado para notificaciones
  const [notification, setNotification] = useState(null)

  // Estados para paginación
  const [currentPageSalto, setCurrentPageSalto] = useState(1)
  const [currentPageReaccion, setCurrentPageReaccion] = useState(1)
  const [pruebasPorPagina] = useState(6)

  // Cargar pruebas y usuarios al iniciar
  useEffect(() => {
    fetchPruebas()
    fetchUsuarios()
  }, [])

  // Obtener todos los usuarios para mapear IDs a nombres
  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener usuarios")
      }

      const data = await response.json()

      // Crear un objeto mapeando ID a nombre completo
      const usuariosMap = {}
      data.forEach((usuario) => {
        usuariosMap[usuario.id] = `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim() || "Usuario sin nombre"
      })

      setUsuarios(usuariosMap)
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
    }
  }

  // Obtener todas las pruebas
  const fetchPruebas = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/alfombras`, {
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener pruebas de salto")
      }

      const pruebasDeSalto = await response.json()

      const pruebasDeReaccionResponse = await fetch(`${API_URL}/reacciones`, {
        headers: {
          Accept: "application/json",
        },
      })

      if (!pruebasDeReaccionResponse.ok) {
        throw new Error("Error al obtener pruebas de reacción")
      }

      const pruebasDeReaccion = await pruebasDeReaccionResponse.json()

      // Asignar tipo a cada prueba
      const saltoConTipo = pruebasDeSalto.map((prueba) => ({
        ...prueba,
        tipo: "Prueba de Salto",
      }))

      const reaccionConTipo = pruebasDeReaccion.map((prueba) => ({
        ...prueba,
        tipo: "Prueba de Reacción",
      }))

      setPruebasSalto(saltoConTipo)
      setPruebasReaccion(reaccionConTipo)
      setError("")
    } catch (error) {
      console.error("Error:", error)
      setError("Error al cargar las pruebas. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Filtrar pruebas según la búsqueda
  const filtrarPruebas = (pruebas) => {
    if (busqueda.trim() === "") {
      return pruebas
    }

    return pruebas.filter((prueba) => {
      const nombreUsuario = usuarios[prueba.jugador_id] || ""
      return nombreUsuario.toLowerCase().includes(busqueda.toLowerCase())
    })
  }

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSelectedPrueba({
      ...selectedPrueba,
      [name]: value,
    })
  }

  // Abrir formulario para editar prueba
  const handleOpenEditForm = (prueba) => {
    setSelectedPrueba(prueba)
    setFormMode("update")
    setShowForm(true)
  }

  // Eliminar prueba
  const handleDeletePrueba = (prueba) => {
    setSelectedPrueba(prueba)
    setShowDeleteModal(true)
  }

  // Confirmar eliminación de prueba
  const handleDeleteConfirm = async () => {
    try {
      setLoading(true)
      const endpoint = selectedPrueba.tipo === "Prueba de Salto" ? "alfombras" : "reacciones"

      const response = await fetch(`${API_URL}/${endpoint}/${selectedPrueba.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la prueba")
      }

      // Recargar la lista de pruebas
      await fetchPruebas()
      setError("")

      // Mostrar notificación de éxito
      setNotification({ type: "success", message: "Prueba eliminada exitosamente" })

      // Cerrar modal de confirmación
      setShowDeleteModal(false)
    } catch (error) {
      console.error("Error:", error)
      setError("Error al eliminar la prueba. Intente nuevamente.")
      setNotification({ type: "error", message: "Error al eliminar la prueba" })
    } finally {
      setLoading(false)
    }
  }

  // Actualizar prueba
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = selectedPrueba.tipo === "Prueba de Salto" ? "alfombras" : "reacciones"

      const response = await fetch(`${API_URL}/${endpoint}/${selectedPrueba.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          jugador_id: selectedPrueba.jugador_id,
          repeticiones: Number.parseInt(selectedPrueba.repeticiones),
          aciertos: Number.parseInt(selectedPrueba.aciertos),
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar la prueba")
      }

      // Recargar la lista de pruebas
      await fetchPruebas()
      setError("")

      // Mostrar notificación de éxito
      setNotification({ type: "success", message: "Prueba actualizada exitosamente" })

      // Cerrar formulario
      setShowForm(false)
      setSelectedPrueba(null)
    } catch (error) {
      console.error("Error:", error)
      setError("Error al actualizar la prueba. Intente nuevamente.")
      setNotification({ type: "error", message: "Error al actualizar la prueba" })
    } finally {
      setLoading(false)
    }
  }

  // Lógica de paginación para pruebas de salto
  const pruebasSaltoFiltradas = filtrarPruebas(pruebasSalto)
  const indexOfLastSalto = currentPageSalto * pruebasPorPagina
  const indexOfFirstSalto = indexOfLastSalto - pruebasPorPagina
  const currentPruebasSalto = pruebasSaltoFiltradas.slice(indexOfFirstSalto, indexOfLastSalto)
  const totalPagesSalto = Math.ceil(pruebasSaltoFiltradas.length / pruebasPorPagina)

  // Lógica de paginación para pruebas de reacción
  const pruebasReaccionFiltradas = filtrarPruebas(pruebasReaccion)
  const indexOfLastReaccion = currentPageReaccion * pruebasPorPagina
  const indexOfFirstReaccion = indexOfLastReaccion - pruebasPorPagina
  const currentPruebasReaccion = pruebasReaccionFiltradas.slice(indexOfFirstReaccion, indexOfLastReaccion)
  const totalPagesReaccion = Math.ceil(pruebasReaccionFiltradas.length / pruebasPorPagina)

  // Cambiar de página
  const paginateSalto = (pageNumber) => setCurrentPageSalto(pageNumber)
  const paginateReaccion = (pageNumber) => setCurrentPageReaccion(pageNumber)

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
          <h1 className="text-3xl font-bold text-black flex items-center">Pruebas</h1>
        </div>

        {/* Buscador de pruebas */}
        <div className="mb-6">
          <div className="relative bg-white rounded-xl shadow-md border border-blue-900/20 overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-blue-900" />
            </div>
            <input
              type="text"
              placeholder="Buscar prueba por nombre de jugador..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-12 pr-12 py-4 border-none focus:ring-2 focus:ring-blue-900/30 text-gray-800 text-base font-medium placeholder-gray-500"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-blue-900 transition-colores"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
            <X className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-4 text-center flex justify-center items-center bg-white shadow-md rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin text-[#1E3A8A] mr-2" />
            <span className="text-black">Cargando pruebas...</span>
          </div>
        ) : (
          <>
            {/* Tabla de pruebas de Salto */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-black mb-4">Pruebas de Salto</h2>
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {pruebasSaltoFiltradas.length === 0 ? (
                  <div className="p-4 text-center text-black">No hay pruebas de salto registradas.</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                              Jugador
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                              Tipo de Prueba
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                              Repeticiones
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                              Aciertos
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentPruebasSalto.map((prueba) => (
                            <tr key={prueba.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-black">
                                {usuarios[prueba.jugador_id] || `ID: ${prueba.jugador_id}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-black">{prueba.tipo}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-black">{prueba.repeticiones}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-black">{prueba.aciertos}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleOpenEditForm(prueba)}
                                    className="text-[#1E3A8A] hover:text-[#152a61] flex items-center"
                                    disabled={loading}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeletePrueba(prueba)}
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

                    {/* Paginación para pruebas de salto */}
                    {pruebasSaltoFiltradas.length > pruebasPorPagina && (
                      <div className="flex justify-between items-center p-4 border-t border-gray-200">
                        <button
                          onClick={() => setCurrentPageSalto((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPageSalto === 1}
                          className={`flex items-center px-3 py-1 rounded ${
                            currentPageSalto === 1
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </button>

                        <div className="flex items-center">
                          <span className="text-sm text-gray-700">
                            Página {currentPageSalto} de {totalPagesSalto}
                          </span>

                          <div className="mx-4 flex space-x-1">
                            {[...Array(totalPagesSalto).keys()].map((number) => (
                              <button
                                key={number + 1}
                                onClick={() => paginateSalto(number + 1)}
                                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                  currentPageSalto === number + 1
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
                          onClick={() => setCurrentPageSalto((prev) => Math.min(prev + 1, totalPagesSalto))}
                          disabled={currentPageSalto === totalPagesSalto}
                          className={`flex items-center px-3 py-1 rounded ${
                            currentPageSalto === totalPagesSalto
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Tabla de pruebas de Reacción */}
            <div>
              <h2 className="text-xl font-bold text-black mb-4">Pruebas de Reacción</h2>
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {pruebasReaccionFiltradas.length === 0 ? (
                  <div className="p-4 text-center text-black">No hay pruebas de reacción registradas.</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                              Jugador
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                              Tipo de Prueba
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                              Repeticiones
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                              Aciertos
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentPruebasReaccion.map((prueba) => (
                            <tr key={prueba.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-black">
                                {usuarios[prueba.jugador_id] || `ID: ${prueba.jugador_id}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-black">{prueba.tipo}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-black">{prueba.repeticiones}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-black">{prueba.aciertos}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleOpenEditForm(prueba)}
                                    className="text-[#1E3A8A] hover:text-[#152a61] flex items-center"
                                    disabled={loading}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeletePrueba(prueba)}
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

                    {/* Paginación para pruebas de reacción */}
                    {pruebasReaccionFiltradas.length > pruebasPorPagina && (
                      <div className="flex justify-between items-center p-4 border-t border-gray-200">
                        <button
                          onClick={() => setCurrentPageReaccion((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPageReaccion === 1}
                          className={`flex items-center px-3 py-1 rounded ${
                            currentPageReaccion === 1
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </button>

                        <div className="flex items-center">
                          <span className="text-sm text-gray-700">
                            Página {currentPageReaccion} de {totalPagesReaccion}
                          </span>

                          <div className="mx-4 flex space-x-1">
                            {[...Array(totalPagesReaccion).keys()].map((number) => (
                              <button
                                key={number + 1}
                                onClick={() => paginateReaccion(number + 1)}
                                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                  currentPageReaccion === number + 1
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
                          onClick={() => setCurrentPageReaccion((prev) => Math.min(prev + 1, totalPagesReaccion))}
                          disabled={currentPageReaccion === totalPagesReaccion}
                          className={`flex items-center px-3 py-1 rounded ${
                            currentPageReaccion === totalPagesReaccion
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal para editar prueba */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg w-full max-w-md border-4 border-gray-400">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-black flex items-center">
                {formMode === "update" ? "Editar Prueba" : "Detalles de Prueba"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setSelectedPrueba(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div>
                  <label className="block text-black font-medium mb-1">Jugador</label>
                  <select
                    name="jugador_id"
                    value={selectedPrueba.jugador_id}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded text-black"
                    required
                    readOnly={formMode === "view"}
                  >
                    <option value="">Seleccionar jugador</option>
                    {Object.entries(usuarios).map(([id, nombre]) => (
                      <option key={id} value={id}>
                        {nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-black font-medium mb-1">Repeticiones</label>
                  <input
                    type="number"
                    name="repeticiones"
                    value={selectedPrueba.repeticiones}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded text-black"
                    required
                    readOnly={formMode === "view"}
                  />
                </div>
                <div>
                  <label className="block text-black font-medium mb-1">Aciertos</label>
                  <input
                    type="number"
                    name="aciertos"
                    value={selectedPrueba.aciertos}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded text-black"
                    required
                    readOnly={formMode === "view"}
                  />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setSelectedPrueba(null)
                    }}
                    className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 flex items-center"
                    disabled={loading}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </button>
                  {formMode === "update" && (
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
                          Actualizar Prueba
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar prueba */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg w-full max-w-md border-4 border-gray-400">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-black flex items-center">
                <Trash2 className="mr-2 h-6 w-6 text-red-500" />
                Confirmar Eliminación
              </h2>
              <p className="text-gray-700 mt-2">
                ¿Está seguro que desea eliminar la prueba de {selectedPrueba?.tipo.toLowerCase()} del jugador "
                {usuarios[selectedPrueba?.jugador_id] || selectedPrueba?.jugador_id}"?
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
